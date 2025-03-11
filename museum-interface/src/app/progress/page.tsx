"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function ProgressPage() {
  const [timeRange, setTimeRange] = useState("all");
  
  // Sample data for the accuracy progression
  const accuracyData = [
    { day: "Day 1", accuracy: 40 },
    { day: "Day 2", accuracy: 45 },
    { day: "Day 3", accuracy: 52 },
    { day: "Day 4", accuracy: 58 },
    { day: "Day 5", accuracy: 62 },
    { day: "Day 6", accuracy: 70 },
    { day: "Day 7", accuracy: 75 },
    { day: "Day 8", accuracy: 78 },
    { day: "Day 9", accuracy: 82 },
    { day: "Day 10", accuracy: 85 },
  ];
  
  // Sample data for the classification breakdown
  const classificationData = [
    { name: "Renaissance", value: 342 },
    { name: "Baroque", value: 186 },
    { name: "Impressionism", value: 128 },
    { name: "Cubism", value: 64 },
    { name: "Other", value: 22 },
  ];
  
  // Sample data for the confidence distribution
  const confidenceData = [
    { confidence: "90-100%", artworks: 120 },
    { confidence: "80-89%", artworks: 220 },
    { confidence: "70-79%", artworks: 180 },
    { confidence: "60-69%", artworks: 140 },
    { confidence: "50-59%", artworks: 60 },
    { confidence: "<50%", artworks: 22 },
  ];
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Progress Curve</h1>
        <p className="text-muted-foreground">
          Visualize the learning progress and performance metrics of the classification model.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary"></div>
            <span className="text-sm">Current accuracy:</span>
            <span className="font-bold">85%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground"></div>
            <span className="text-sm">Target accuracy:</span>
            <span className="font-bold">90%</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={timeRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            Last Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Last Month
          </Button>
          <Button
            variant={timeRange === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange("all")}
          >
            All Time
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Model Accuracy Over Time</CardTitle>
          <CardDescription>
            Progression of the model's accuracy throughout the learning phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={accuracyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  name="Accuracy (%)" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  name="Target" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Classification Breakdown</CardTitle>
            <CardDescription>
              Distribution of artworks by their classified styles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classificationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {classificationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Confidence Distribution</CardTitle>
            <CardDescription>
              Number of artworks by confidence level in their classification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={confidenceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="confidence" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="artworks" name="Number of Artworks" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Learning Metrics</CardTitle>
          <CardDescription>
            Key performance indicators for the current learning phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm">85%</span>
              </div>
              <Progress value={85} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Renaissance Recognition</span>
                <span className="text-sm">92%</span>
              </div>
              <Progress value={92} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Baroque Recognition</span>
                <span className="text-sm">87%</span>
              </div>
              <Progress value={87} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Modern Art Recognition</span>
                <span className="text-sm">76%</span>
              </div>
              <Progress value={76} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Estimated time to reach 90% target accuracy: <span className="font-medium text-foreground">3 days</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 