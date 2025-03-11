"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Trash2, Save, HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QuestionnairePage() {
  const [questions, setQuestions] = useState([
    { id: 1, text: "Is this artwork a landscape or portrait?", options: ["Landscape", "Portrait", "Neither"] },
    { id: 2, text: "What period does this artwork belong to?", options: ["Renaissance", "Baroque", "Modern", "Contemporary"] },
  ]);
  const [newQuestion, setNewQuestion] = useState({ text: "", options: ["", ""] });

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""]
    });
  };

  const removeOption = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index)
    });
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  const addQuestion = () => {
    if (newQuestion.text.trim() === "") return;
    if (newQuestion.options.some(option => option.trim() === "")) return;
    
    setQuestions([
      ...questions,
      {
        id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
        text: newQuestion.text,
        options: newQuestion.options
      }
    ]);
    
    setNewQuestion({ text: "", options: ["", ""] });
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const exampleArtworks = [
    { id: 1, title: "The Starry Night", artist: "Vincent van Gogh", year: 1889, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/300px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg" },
    { id: 2, title: "Girl with a Pearl Earring", artist: "Johannes Vermeer", year: 1665, imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/300px-1665_Girl_with_a_Pearl_Earring.jpg" },
    { id: 3, title: "The Persistence of Memory", artist: "Salvador Dalí", year: 1931, imageUrl: "https://uploads2.wikiart.org/00142/images/salvador-dali/the-persistence-of-memory-1931.jpg!Large.jpg" }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Questionnaire</h1>
        <p className="text-muted-foreground">
          Create and manage the questions that will be used to classify artworks.
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">Create Questions</TabsTrigger>
          <TabsTrigger value="manage">Manage Questions</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Question</CardTitle>
              <CardDescription>
                Define a new question and its possible answers for artwork classification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question Text</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., Is this artwork a landscape or portrait?"
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium">Possible Answers</label>
                  <Button variant="ghost" size="sm" onClick={addOption}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 p-2 border rounded-md"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                      />
                      {newQuestion.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={() => setNewQuestion({ text: "", options: ["", ""] })}>
                Clear
              </Button>
              <Button onClick={addQuestion}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Questions</CardTitle>
              <CardDescription>
                Review and edit your current set of questions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No questions yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{question.text}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="pl-2 space-y-1">
                        {question.options.map((option, index) => (
                          <div key={index} className="text-sm flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary"></div>
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-end">
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview Questionnaire</CardTitle>
              <CardDescription>
                See how your questions will appear during the classification process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="font-medium">Artwork Sample</div>
                  <div className="border rounded-lg overflow-hidden artwork-card">
                    <img
                      src={exampleArtworks[0].imageUrl}
                      alt={exampleArtworks[0].title}
                      className="w-full h-64 object-contain bg-secondary/30"
                    />
                    <div className="p-3">
                      <h3 className="font-medium">{exampleArtworks[0].title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exampleArtworks[0].artist}, {exampleArtworks[0].year}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="font-medium">Questions</div>
                  {questions.length === 0 ? (
                    <div className="text-muted-foreground">No questions available for preview.</div>
                  ) : (
                    <div className="space-y-6">
                      {questions.map((question) => (
                        <div key={question.id} className="space-y-2">
                          <h4 className="font-medium">{question.text}</h4>
                          <div className="space-y-2">
                            {question.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id={`q${question.id}-o${index}`}
                                  name={`question-${question.id}`}
                                  className="h-4 w-4 text-primary"
                                />
                                <label htmlFor={`q${question.id}-o${index}`} className="text-sm">
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <Button className="w-full">Submit Answers</Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 