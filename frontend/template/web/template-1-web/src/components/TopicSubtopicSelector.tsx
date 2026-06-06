import { SearchableDropdown } from '@/components/SearchableDropdown';
import type { TopicDTO } from '@/dto/topic.dto';
import type { SubtopicDTO } from '@/dto/subtopic.dto';

interface TopicSubtopicSelectorProps {
  topics: TopicDTO[];
  subtopics: SubtopicDTO[];
  selectedTopicId: string;
  selectedSubtopicId: string;
  onTopicChange: (topicId: string) => void;
  onSubtopicChange: (subtopicId: string) => void;
  showTopicOnly?: boolean;
  topicLabel?: string;
  subtopicLabel?: string;
  layout?: 'horizontal' | 'vertical';
}

export function TopicSubtopicSelector({
  topics,
  subtopics,
  selectedTopicId,
  selectedSubtopicId,
  onTopicChange,
  onSubtopicChange,
  showTopicOnly = false,
  topicLabel = 'Topic',
  subtopicLabel = 'Subtopic',
  layout = 'horizontal',
}: TopicSubtopicSelectorProps) {
  const topicItems = topics.map((t) => ({
    value: String(t.id),
    label: t.name,
    meta: t.shortDesc ?? undefined,
  }));

  const filteredSubtopics = selectedTopicId
    ? subtopics.filter((s) => String(s.topicId) === selectedTopicId)
    : subtopics;

  const subtopicItems = filteredSubtopics.map((s) => ({
    value: String(s.id),
    label: s.name,
    meta: s.difficulty,
  }));

  const handleTopicChange = (value: string) => {
    onTopicChange(value);
    onSubtopicChange('');
  };

  const containerClass =
    layout === 'horizontal' ? 'grid grid-cols-2 gap-3' : 'space-y-3';

  return (
    <div className={containerClass}>
      <SearchableDropdown
        label={topicLabel}
        placeholder="Select topic..."
        items={topicItems}
        selected={selectedTopicId}
        onSelect={handleTopicChange}
      />
      {!showTopicOnly && (
        <SearchableDropdown
          label={subtopicLabel}
          placeholder={selectedTopicId ? 'Select subtopic...' : 'Select a topic first'}
          items={subtopicItems}
          selected={selectedSubtopicId}
          onSelect={onSubtopicChange}
          disabled={!selectedTopicId}
        />
      )}
    </div>
  );
}
