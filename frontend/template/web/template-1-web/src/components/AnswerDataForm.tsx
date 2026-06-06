import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ExerciseQuestionType } from '@/dto/enums';

interface DrawLineMatchData {
  leftItems: string[];
  rightItems: string[];
  pairs: [number, number][];
  hint?: string;
}

interface RearrangeSentenceData {
  sentence: string;
  words: string[];
  correctOrder: number[];
  hint?: string;
}

interface AnswerDataFormProps {
  questionType: 'DRAW_LINE_MATCH' | 'REARRANGE_SENTENCE';
  value: Record<string, unknown> | null;
  onChange: (data: Record<string, unknown> | null) => void;
}

function DrawLineMatchForm({
  value,
  onChange,
}: {
  value: DrawLineMatchData;
  onChange: (d: DrawLineMatchData) => void;
}) {
  const handleLeftChange = (index: number, newValue: string) => {
    const newLeft = [...value.leftItems];
    newLeft[index] = newValue;
    onChange({ ...value, leftItems: newLeft });
  };

  const handleRightChange = (index: number, newValue: string) => {
    const newRight = [...value.rightItems];
    newRight[index] = newValue;
    onChange({ ...value, rightItems: newRight });
  };

  const handlePairChange = (pairIndex: number, leftIdx: string, rightIdx: string) => {
    const newPairs = [...value.pairs];
    newPairs[pairIndex] = [parseInt(leftIdx) || 0, parseInt(rightIdx) || 0];
    onChange({ ...value, pairs: newPairs });
  };

  const addLeftItem = () => {
    onChange({ ...value, leftItems: [...value.leftItems, ''] });
  };

  const addRightItem = () => {
    onChange({ ...value, rightItems: [...value.rightItems, ''] });
  };

  const addPair = () => {
    onChange({ ...value, pairs: [...value.pairs, [0, 0]] });
  };

  const removeLeftItem = (index: number) => {
    const newLeft = value.leftItems.filter((_, i) => i !== index);
    // Remove pairs that reference this item
    const newPairs = value.pairs.filter(p => p[0] !== index).map(p => [p[0] > index ? p[0] - 1 : p[0], p[1]]);
    onChange({ ...value, leftItems: newLeft, pairs: newPairs as [number, number][] });
  };

  const removeRightItem = (index: number) => {
    const newRight = value.rightItems.filter((_, i) => i !== index);
    // Remove pairs that reference this item
    const newPairs = value.pairs.filter(p => p[1] !== index).map(p => [p[0], p[1] > index ? p[1] - 1 : p[1]]);
    onChange({ ...value, rightItems: newRight, pairs: newPairs as [number, number][] });
  };

  const removePair = (index: number) => {
    onChange({ ...value, pairs: value.pairs.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4 border border-cyan-200 bg-cyan-50 rounded-lg p-4">
      <p className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">Draw Line Match Data</p>

      {/* Left Items */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Left Items</Label>
        <div className="space-y-2">
          {value.leftItems.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleLeftChange(i, e.target.value)}
                placeholder={`Item ${i + 1}`}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeLeftItem(i)}
                className="px-3"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addLeftItem} className="w-full">
          + Add Left Item
        </Button>
      </div>

      {/* Right Items */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Right Items</Label>
        <div className="space-y-2">
          {value.rightItems.map((item, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleRightChange(i, e.target.value)}
                placeholder={`Match ${i + 1}`}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeRightItem(i)}
                className="px-3"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addRightItem} className="w-full">
          + Add Right Item
        </Button>
      </div>

      {/* Pairs */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Matching Pairs</Label>
        <div className="space-y-2">
          {value.pairs.map((pair, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={pair[0]}
                onChange={(e) => handlePairChange(i, e.target.value, pair[1].toString())}
                className="flex-1 px-2 py-1 border rounded"
              >
                <option value="">Select left item</option>
                {value.leftItems.map((_, idx) => (
                  <option key={idx} value={idx}>
                    {value.leftItems[idx] || `Left Item ${idx + 1}`}
                  </option>
                ))}
              </select>
              <span className="text-slate-400">→</span>
              <select
                value={pair[1]}
                onChange={(e) => handlePairChange(i, pair[0].toString(), e.target.value)}
                className="flex-1 px-2 py-1 border rounded"
              >
                <option value="">Select right item</option>
                {value.rightItems.map((_, idx) => (
                  <option key={idx} value={idx}>
                    {value.rightItems[idx] || `Right Item ${idx + 1}`}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removePair(i)}
                className="px-3"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addPair} className="w-full">
          + Add Pair
        </Button>
      </div>

      {/* Hint */}
      <div className="space-y-1">
        <Label className="text-xs">Hint (optional)</Label>
        <Input
          value={value.hint ?? ''}
          onChange={(e) => onChange({ ...value, hint: e.target.value || undefined })}
          placeholder="e.g. Match related items"
        />
      </div>

      <div className="bg-white border border-cyan-200 rounded p-2">
        <p className="text-xs text-slate-500 font-mono break-all">
          Preview JSON: {JSON.stringify(value, null, 0)}
        </p>
      </div>
    </div>
  );
}

function RearrangeSentenceForm({
  value,
  onChange,
}: {
  value: RearrangeSentenceData;
  onChange: (d: RearrangeSentenceData) => void;
}) {
  const handleWordChange = (index: number, newValue: string) => {
    const newWords = [...value.words];
    newWords[index] = newValue;
    onChange({ ...value, words: newWords });
  };

  const handleOrderChange = (orderIndex: number, wordIndex: string) => {
    const newOrder = [...value.correctOrder];
    newOrder[orderIndex] = parseInt(wordIndex) || 0;
    onChange({ ...value, correctOrder: newOrder });
  };

  const addWord = () => {
    const newWords = [...value.words, ''];
    const newOrder = value.correctOrder.length === 0 ? [value.words.length] : value.correctOrder;
    onChange({ ...value, words: newWords, correctOrder: newOrder });
  };

  const removeWord = (index: number) => {
    const newWords = value.words.filter((_, i) => i !== index);
    const newOrder = value.correctOrder
      .filter(o => o !== index)
      .map(o => (o > index ? o - 1 : o));
    onChange({ ...value, words: newWords, correctOrder: newOrder });
  };

  return (
    <div className="space-y-4 border border-purple-200 bg-purple-50 rounded-lg p-4">
      <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Rearrange Sentence Data</p>

      {/* Original Sentence */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">Original Sentence</Label>
        <Textarea
          value={value.sentence}
          onChange={(e) => onChange({ ...value, sentence: e.target.value })}
          placeholder="e.g. The quick brown fox jumps over the lazy dog."
          rows={2}
        />
      </div>

      {/* Words */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Words to Arrange (in random order)</Label>
        <div className="space-y-2">
          {value.words.map((word, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={word}
                onChange={(e) => handleWordChange(i, e.target.value)}
                placeholder={`Word ${i + 1}`}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeWord(i)}
                className="px-3"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addWord} className="w-full">
          + Add Word
        </Button>
      </div>

      {/* Correct Order */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold">Correct Order (indices)</Label>
        <div className="flex gap-2 flex-wrap">
          {value.correctOrder.map((wordIdx, orderPos) => (
            <div key={orderPos} className="flex items-center gap-1 bg-white px-2 py-1 rounded border">
              <span className="text-xs text-slate-500">Position {orderPos + 1}:</span>
              <select
                value={wordIdx}
                onChange={(e) => handleOrderChange(orderPos, e.target.value)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="">Select word</option>
                {value.words.map((word, idx) => (
                  <option key={idx} value={idx}>
                    {word || `Word ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600 italic">
          {value.correctOrder.length}/{value.words.length} positions assigned
        </p>
      </div>

      {/* Hint */}
      <div className="space-y-1">
        <Label className="text-xs">Hint (optional)</Label>
        <Input
          value={value.hint ?? ''}
          onChange={(e) => onChange({ ...value, hint: e.target.value || undefined })}
          placeholder="e.g. Arrange in alphabetical order"
        />
      </div>

      <div className="bg-white border border-purple-200 rounded p-2">
        <p className="text-xs text-slate-500 font-mono break-all">
          Preview JSON: {JSON.stringify(value, null, 0)}
        </p>
      </div>
    </div>
  );
}

export function AnswerDataForm({ questionType, value, onChange }: AnswerDataFormProps) {
  const [drawLineData, setDrawLineData] = useState<DrawLineMatchData>({
    leftItems: [],
    rightItems: [],
    pairs: [],
    hint: undefined,
  });
  const [rearrangeData, setRearrangeData] = useState<RearrangeSentenceData>({
    sentence: '',
    words: [],
    correctOrder: [],
    hint: undefined,
  });

  useEffect(() => {
    if (value) {
      if (questionType === ExerciseQuestionType.DRAW_LINE_MATCH) {
        setDrawLineData({
          leftItems: (value.leftItems as string[]) ?? [],
          rightItems: (value.rightItems as string[]) ?? [],
          pairs: (value.pairs as [number, number][]) ?? [],
          hint: (value.hint as string | undefined),
        });
      } else if (questionType === ExerciseQuestionType.REARRANGE_SENTENCE) {
        setRearrangeData({
          sentence: (value.sentence as string) ?? '',
          words: (value.words as string[]) ?? [],
          correctOrder: (value.correctOrder as number[]) ?? [],
          hint: (value.hint as string | undefined),
        });
      }
    } else {
      if (questionType === ExerciseQuestionType.DRAW_LINE_MATCH) {
        setDrawLineData({ leftItems: [], rightItems: [], pairs: [], hint: undefined });
      } else {
        setRearrangeData({ sentence: '', words: [], correctOrder: [], hint: undefined });
      }
    }
  }, [questionType, value === null]);

  const handleDrawLineChange = (d: DrawLineMatchData) => {
    setDrawLineData(d);
    const cleaned: Record<string, unknown> = {
      leftItems: d.leftItems,
      rightItems: d.rightItems,
      pairs: d.pairs,
    };
    if (d.hint) cleaned.hint = d.hint;
    onChange(cleaned);
  };

  const handleRearrangeChange = (d: RearrangeSentenceData) => {
    setRearrangeData(d);
    const cleaned: Record<string, unknown> = {
      sentence: d.sentence,
      words: d.words,
      correctOrder: d.correctOrder,
    };
    if (d.hint) cleaned.hint = d.hint;
    onChange(cleaned);
  };

  if (questionType === ExerciseQuestionType.DRAW_LINE_MATCH) {
    return <DrawLineMatchForm value={drawLineData} onChange={handleDrawLineChange} />;
  }

  return <RearrangeSentenceForm value={rearrangeData} onChange={handleRearrangeChange} />;
}
