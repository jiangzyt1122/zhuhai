import React, { useState } from 'react';
import { EntryPortal } from './components/EntryPortal';
import { EnglishLearningHub } from './components/EnglishLearningHub';
import { ExploreAppShell } from './components/ExploreAppShell';

type AppSection = 'entry' | 'english' | 'explore';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AppSection>('entry');

  if (activeSection === 'english') {
    return <EnglishLearningHub onBack={() => setActiveSection('entry')} />;
  }

  if (activeSection === 'explore') {
    return <ExploreAppShell onBack={() => setActiveSection('entry')} />;
  }

  return (
    <EntryPortal
      onOpenEnglish={() => setActiveSection('english')}
      onOpenExplore={() => setActiveSection('explore')}
    />
  );
};

export default App;
