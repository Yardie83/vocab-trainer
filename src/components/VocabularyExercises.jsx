import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import Papa from 'papaparse';
import _ from 'lodash';

// Fun emoji feedback messages
const feedbackMessages = {
  correct: [
    "🎉 Fantastic job!",
    "⭐ You're amazing!",
    "🌟 Brilliant!",
    "🎯 Perfect!",
    "🦄 Magical!",
    "🌈 Wonderful!",
    "🚀 Super!",
    "🏆 Champion!"
  ],
  incorrect: [
    "🤔 Almost there!",
    "💪 Keep trying!",
    "🌱 You're learning!",
    "🎯 Getting closer!",
    "✨ Nice try!",
    "🌟 Good effort!"
  ]
};

const ExerciseItem = ({ exercise, data, onScoreChange }) => {
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState('');

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,!?;:'"()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showAnswer) {
        handleReset();
      } else {
        handleCheck();
      }
    }
  };

  const handleCheck = () => {
    // Don't process empty submissions
    if (!userInput.trim()) {
      return;
    }

    const isCorrect = exercise.checkAnswer(userInput, data);
    setShowAnswer(true);
    onScoreChange(isCorrect);
    // Set random feedback message
    const messages = isCorrect ? feedbackMessages.correct : feedbackMessages.incorrect;
    setFeedback(messages[Math.floor(Math.random() * messages.length)]);
  };

  const handleReset = () => {
    setUserInput('');
    setShowAnswer(false);
    setFeedback('');
  };

  return (
    <div className="mb-8 p-6 border-2 rounded-2xl bg-gradient-to-b from-purple-50 to-white border-purple-100 shadow-lg">
      <div className="font-medium mb-4 text-lg text-purple-800">{exercise.prompt}</div>

      {exercise.type === 'fillInBlank' ? (
        <div className="mb-4">
          <div className="bg-blue-50 p-4 rounded-xl mb-3 border-2 border-blue-100">
            <strong className="text-blue-700">German word:</strong>
            <span className="text-blue-600 ml-2 text-lg">{data.german}</span>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-100">
            <strong className="text-yellow-700">Sentence:</strong>
            <span className="text-yellow-600 ml-2 text-lg">{exercise.getQuestion(data)}</span>
          </div>
        </div>
      ) : (
        <div className="text-xl mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-100">
          {exercise.getQuestion(data)}
        </div>
      )}

      {exercise.inputType === 'short' ? (
        <Input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="✏️ Type your answer here..."
          className="mb-4 rounded-xl border-2 border-purple-200 p-6 text-lg focus:border-purple-400 focus:ring-purple-400"
          disabled={showAnswer}
          onKeyPress={handleKeyPress}
        />
      ) : (
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="✏️ Type your answer here..."
          className="mb-4 rounded-xl border-2 border-purple-200 p-4 text-lg focus:border-purple-400 focus:ring-purple-400"
          disabled={showAnswer}
          rows={3}
          onKeyPress={handleKeyPress}
        />
      )}

      {!showAnswer ? (
        <Button
          onClick={handleCheck}
          className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-200"
        >
          Check Answer 🎯
        </Button>
      ) : (
        <div className="mb-4">
            <div className={`p-6 rounded-xl mb-4 border-2 ${exercise.checkAnswer(userInput, data)
              ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200'
              : 'bg-gradient-to-r from-orange-50 to-yellow-100 border-orange-200'
              }`}>
            <div className="font-medium text-xl mb-2 text-center">
              {feedback}
            </div>
            <div className="mt-4 p-3 bg-white rounded-lg">
                <strong className="text-gray-700">Correct answer:</strong>
              <span className="ml-2 text-lg">{exercise.getAnswer(data)}</span>
            </div>
          </div>
            <Button
            onClick={handleReset}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg p-6 rounded-xl shadow-md transform hover:scale-105 transition-transform duration-200"
          >
            Try Another ⭐
          </Button>
        </div>
      )}
    </div>
  );
};

const VocabularyExercises = () => {
  const [vocabData, setVocabData] = useState([]);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [exercises, setExercises] = useState([]);

  const exerciseTypes = {
    wordTranslation: {
      type: 'wordTranslation',
      prompt: '🎯 Translate this word to English:',
      getQuestion: (item) => item.german,
      checkAnswer: (input, item) => normalizeText(input) === normalizeText(item.english),
      getAnswer: (item) => item.english,
      inputType: 'short'
    },
    germanToEnglishSentence: {
      type: 'germanToEnglishSentence',
      prompt: '📝 Translate this German sentence to English:',
      getQuestion: (item) => item.satz,
      checkAnswer: (input, item) => normalizeText(input) === normalizeText(item.sentence),
      getAnswer: (item) => item.sentence,
      inputType: 'long'
    },
    englishToGermanSentence: {
      type: 'englishToGermanSentence',
      prompt: '✨ Translate this English sentence to German:',
      getQuestion: (item) => item.sentence,
      checkAnswer: (input, item) => normalizeText(input) === normalizeText(item.satz),
      getAnswer: (item) => item.satz,
      inputType: 'long'
    },
    fillInBlank: {
      type: 'fillInBlank',
      prompt: '🎨 Fill in the blank with the English translation:',
      getQuestion: (item) => item.sentence.replace(item.english, '_____'),
      checkAnswer: (input, item) => normalizeText(input) === normalizeText(item.english),
      getAnswer: (item) => item.english,
      inputType: 'short'
    }
  };

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[.,!?;:'"()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting to load data');

        // Use fetch for both local and production
        const response = await fetch(`${import.meta.env.DEV ? '/' : import.meta.env.BASE_URL}vocab.csv`);
        console.log('Response:', response);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const csvText = await response.text();
        console.log('CSV text received:', csvText.substring(0, 100));

        const result = Papa.parse(csvText, {
          header: true,
          delimiter: ';', // Specify semicolon delimiter
          skipEmptyLines: true
        });

        console.log('Parsed data:', result.data);

        if (result.data.length === 0) {
          throw new Error('No data parsed from CSV');
        }

        setVocabData(result.data);

        const allExercises = result.data.flatMap(item =>
          Object.entries(exerciseTypes).map(([type, exercise]) => ({
            type,
            exercise,
            data: item
          }))
        );

        console.log('Created exercises:', allExercises.length);
        setExercises(_.shuffle(allExercises));
      } catch (error) {
        console.error('Error loading vocabulary data:', error);
      }
    };

    loadData();
  }, []);

  // Also add a render log
  console.log('Rendering VocabularyExercises component');

  const handleScoreChange = (isCorrect) => {
    setTotalAttempts(prev => prev + 1);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  if (!exercises.length) {
    return <div className="p-8 text-center text-xl">
      Loading your fun exercises... 🎮
    </div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-gradient-to-b from-purple-100 via-white to-purple-100 min-h-screen">
      <Card className="mb-6 border-2 border-purple-200 rounded-2xl overflow-hidden shadow-lg">
        <CardContent className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2 text-purple-800">
              Your Progress 🌟
            </div>
            <div className="text-lg">
              Score: {score}/{totalAttempts}
              <span className="text-purple-600 ml-2">
                ({totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {exercises.map((item, index) => (
        <ExerciseItem
          key={`${item.data.english}-${item.type}-${index}`}
          exercise={item.exercise}
          data={item.data}
          onScoreChange={handleScoreChange}
        />
      ))}
    </div>
  );
};

export default VocabularyExercises;