#!/usr/bin/env python3

from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import urllib.request
from pathlib import Path
from typing import Any

BASE_URL = "https://englishnewsinlevels.com"
DEFAULT_OUTPUT = Path("tmp/englishnewsinlevels-latest.json")
GENERATED_OUTPUT = Path("src/data/generatedEnglishArticles.json")
TMP_GLOB = "englishnewsinlevels-*.json"

LATEST_LEVEL1_PATH_RE = re.compile(r'href="(/news/level-1/[^"]+)"')
HOMEPAGE_DATE_RE = re.compile(
    r"(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{4}/\d{2}/\d{2})"
)
FLIGHT_PUSH_RE = re.compile(r'self\.__next_f\.push\(\[1,"(.*?)"\]\)</script>', re.S)
ESCAPED_NEWS_RE = re.compile(r'\\"news\\":\{.*?\\"public\\":true,\\"readCount\\":\d+\}', re.S)
REFERENCE_TOKEN_RE = re.compile(r"^\$([0-9A-Za-z]+)$")


def fetch_text(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; zhuhai-kids-explore/1.0; +https://github.com/)"
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read().decode("utf-8", "ignore")


def decode_escaped_json(blob: str) -> dict:
    return json.loads(blob.encode("utf-8").decode("unicode_escape"))


def extract_flight_stream(html: str) -> str:
    parts = FLIGHT_PUSH_RE.findall(html)
    return "".join(parts) if parts else html


def resolve_text_reference(ref_id: str, html: str) -> str | None:
    patterns = [
        rf"{re.escape(ref_id)}:T[0-9a-f]+,(.*?)(?=(?:\\\\\\\\n[0-9A-Za-z]+:)|(?:\"\\]\)</script>))",
        rf"{re.escape(ref_id)}:T[0-9a-f]+,(.*?)(?=\"\\]\)</script>)",
        rf"{re.escape(ref_id)}:T[0-9a-f]+,(.*)",
    ]
    for raw_pattern in patterns:
        match = re.search(raw_pattern, html, re.S)
        if match:
            return match.group(1).encode("utf-8").decode("unicode_escape")
    return None


def extract_news_payload(html: str) -> dict:
    match = ESCAPED_NEWS_RE.search(html)
    if not match:
        raise RuntimeError("Could not find article payload in page HTML.")
    return decode_escaped_json("{" + match.group(0) + "}")


def resolve_level_content(levels: list[dict], html: str) -> list[dict]:
    resolved: list[dict] = []
    for item in levels:
        next_item = dict(item)
        content = next_item.get("content", "")
        if isinstance(content, str):
            ref_match = REFERENCE_TOKEN_RE.match(content)
            if ref_match:
                resolved_content = resolve_text_reference(ref_match.group(1), html)
                if resolved_content:
                    next_item["content"] = resolved_content
        resolved.append(next_item)
    return resolved


def discover_level1_url_for_date(target_date: str) -> str:
    home_html = fetch_text(f"{BASE_URL}/")
    seen_paths: set[str] = set()

    for match in LATEST_LEVEL1_PATH_RE.finditer(home_html):
        path = match.group(1)
        if path in seen_paths:
            continue
        seen_paths.add(path)

        search_window = home_html[match.end() : match.end() + 2000]
        date_match = HOMEPAGE_DATE_RE.search(search_window)
        if not date_match:
            continue

        article_date = date_match.group(2)
        if article_date == target_date:
            return f"{BASE_URL}{path}"

    raise RuntimeError(
        f"Could not find a level-1 homepage article for {target_date}."
    )


def normalize_article(url: str, html: str) -> dict:
    flight_stream = extract_flight_stream(html)
    payload = extract_news_payload(flight_stream)
    news = payload["news"]
    levels = resolve_level_content(news["levels"], flight_stream)
    published_at = dt.datetime.fromtimestamp(news["date"] / 1000, tz=dt.timezone.utc).isoformat()

    return {
        "source": "englishnewsinlevels",
        "scrapedAt": dt.datetime.now(tz=dt.timezone.utc).isoformat(),
        "articleUrl": url,
        "title": news["title"],
        "summary": news["summary"],
        "publishedAt": published_at,
        "cover": news.get("cover"),
        "originalUrl": news.get("originalUrl"),
        "readCount": news.get("readCount"),
        "levels": [
            {
                "level": item["level"],
                "title": item["title"],
                "content": item.get("content", ""),
                "audio": item.get("audio"),
                "vocabulary": item.get("vocabulary", []),
                "quiz": item.get("quiz", []),
            }
            for item in levels
        ],
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export one English News In Levels article into a local JSON file."
    )
    parser.add_argument(
        "--url",
        help="Article URL to fetch. If omitted, the script uses the homepage article that matches --date.",
    )
    parser.add_argument(
        "--date",
        default=dt.date.today().strftime("%Y/%m/%d"),
        help="Homepage article date in YYYY/MM/DD. Default: local run date.",
    )
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT),
        help=f"Output JSON path. Default: {DEFAULT_OUTPUT}",
    )
    parser.add_argument(
        "--skip-sync",
        action="store_true",
        help="Skip regenerating src/data/generatedEnglishArticles.json.",
    )
    return parser.parse_args()


def load_json_if_possible(path: Path) -> dict[str, Any] | None:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None

    return payload if isinstance(payload, dict) else None


def build_article_identity(article: dict[str, Any]) -> str:
    article_url = article.get("articleUrl")
    if isinstance(article_url, str) and article_url:
        return article_url

    title = article.get("title")
    published_at = article.get("publishedAt")
    return f"{title}|{published_at}"


def article_sort_key(article: dict[str, Any]) -> float:
    published_at = article.get("publishedAt")
    if not isinstance(published_at, str) or not published_at:
        return float("-inf")

    normalized = published_at.replace("Z", "+00:00")
    try:
        return dt.datetime.fromisoformat(normalized).timestamp()
    except ValueError:
        return float("-inf")


def sync_generated_articles(current_article: dict[str, Any], current_output: Path) -> None:
    articles_by_id: dict[str, dict[str, Any]] = {}

    for path in sorted(DEFAULT_OUTPUT.parent.glob(TMP_GLOB)):
        payload = load_json_if_possible(path)
        if payload is None:
            continue
        articles_by_id[build_article_identity(payload)] = payload

    if current_output.parent.exists() and current_output.parent == DEFAULT_OUTPUT.parent:
        payload = load_json_if_possible(current_output)
        if payload is not None:
            articles_by_id[build_article_identity(payload)] = payload

    articles_by_id[build_article_identity(current_article)] = current_article

    generated_articles = sorted(
        articles_by_id.values(),
        key=article_sort_key,
        reverse=True,
    )

    GENERATED_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    GENERATED_OUTPUT.write_text(
        json.dumps(generated_articles, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def main() -> None:
    args = parse_args()
    article_url = args.url or discover_level1_url_for_date(args.date)
    html = fetch_text(article_url)
    article = normalize_article(article_url, html)

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(article, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {output_path}")
    if not args.skip_sync:
        sync_generated_articles(article, output_path)
        print(f"Wrote {GENERATED_OUTPUT}")


if __name__ == "__main__":
    main()
