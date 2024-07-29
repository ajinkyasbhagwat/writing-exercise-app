import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const activityTypes = [
  'add_thesis_statement',
  'add_main_idea',
  'add_details',
  'add_concluding_statement',
  'write_complete_transition_outline',
  'draft_composition_from_transition_outline'
];

const App = () => {
  const [currentActivity, setCurrentActivity] = useState(0);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const student = {
    interests: ['science', 'technology'],
    knowledge_tree: {
      id: 1,
      status: 'active',
      title: 'Writing Skills',
      school_year: '2023-2024',
      course_code: 'WRT101',
      grades: '9-10',
      subjects: 'English',
      subject_codes: 'ENG',
      modules: [
        {
          id: 1,
          name: 'Essay Writing',
          unlock_at: '2023-09-01T00:00:00Z',
          state: 'unlocked',
          items: [
            {
              id: 1,
              name: 'Introduction to Essay Writing',
              state: 'completed',
              lti_url: 'https://example.com/lti/1',
              progress: 1.0
            }
          ],
          progress: 0.5
        }
      ]
    },
    age_grade: 9
  };

  const handleQuestionEvaluationAPI = async (inputData, url) => {
    setIsLoading(true);
    let textResponse = '';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(inputData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      textResponse = data;
    } catch (error) {
      console.error('Error fetching answer:', error);
      textResponse = 'Sorry, there was an error fetching the answer. Please try again.';
    } finally {
      setIsLoading(false);
      return textResponse;
    }
  };

  const generateQuestion = async () => {
    setError(null);
    const data = {
      activityType: activityTypes[currentActivity],
      student: student
    };
    const response = await handleQuestionEvaluationAPI(data, 'https://alpha-essay-writing-production-23951028ed84.herokuapp.com/generate');
    if (response.error) {
      setError(response.error);
    } else {
      setQuestion(response);
    }
  };

  const evaluateAnswer = async () => {
    setError(null);
    const data = {
      answer: { RESPONSE: answer },
      activity: question.activity,
      student: student
    };
    const response = await handleQuestionEvaluationAPI(data, 'https://alpha-essay-writing-production-23951028ed84.herokuapp.com/evaluate');
    if (response.error) {
      setError(response.error);
    } else {
      setEvaluation(response);
    }
  };

  const handleNextActivity = () => {
    if (currentActivity < activityTypes.length - 1) {
      setCurrentActivity(currentActivity + 1);
      setQuestion(null);
      setAnswer('');
      setEvaluation(null);
      setError(null);
    }
  };

  const handlePreviousActivity = () => {
    if (currentActivity > 0) {
      setCurrentActivity(currentActivity - 1);
      setQuestion(null);
      setAnswer('');
      setEvaluation(null);
      setError(null);
    }
  };

  useEffect(() => {
    generateQuestion();
  }, [currentActivity]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Writing Exercise</h1>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {question && (
        <Card className="mb-4">
          <CardHeader>
            <h2 className="text-xl font-semibold">{question.item_body.stimulus_title}</h2>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: question.item_body.stimulus_content.content }} />
            {activityTypes[currentActivity] === 'add_main_idea' && (
              <p className="mt-2 text-sm text-gray-600">Requirement: At least four lines</p>
            )}
            {activityTypes[currentActivity] === 'add_details' && (
              <p className="mt-2 text-sm text-gray-600">Requirement: At least eight lines</p>
            )}
          </CardContent>
        </Card>
      )}
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here..."
        className="mb-4"
        rows={6}
      />
      <div className="flex justify-between mb-4">
        <Button onClick={handlePreviousActivity} disabled={currentActivity === 0 || isLoading}>
          Previous
        </Button>
        <Button onClick={evaluateAnswer} disabled={!answer || isLoading}>
          {isLoading ? 'Evaluating...' : 'Evaluate'}
        </Button>
        <Button onClick={handleNextActivity} disabled={currentActivity === activityTypes.length - 1 || isLoading}>
          Next
        </Button>
      </div>
      {evaluation && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Evaluation</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-2"><strong>Critique:</strong> {evaluation.critique}</p>
            <p><strong>Scores:</strong></p>
            <ul className="list-disc list-inside">
              <li>Structure: {evaluation.structure}</li>
              <li>Coherence: {evaluation.coherence}</li>
              <li>Unity: {evaluation.unity}</li>
              <li>Well-constructed sentences: {evaluation.well_constructed_sentences}</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default App;