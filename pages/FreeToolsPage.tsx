import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Loader2, Wrench, ExternalLink, ArrowLeft, Home, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useLocation } from "wouter";

interface FreeTool {
  id: number;
  title: string;
  description: string | null;
  htmlCode: string;
  category: string | null;
  isActive: boolean;
  submittedAt: string;
  webhookSource: string | null;
  metadata: any;
}

export default function FreeToolsPage() {
  const [selectedTool, setSelectedTool] = useState<FreeTool | null>(null);

  const { data: tools, isLoading } = useQuery<FreeTool[]>({
    queryKey: ["/api/tools"],
  });

  const handleToolClick = (tool: FreeTool) => {
    setSelectedTool(tool);
  };

  const handleCloseDialog = () => {
    setSelectedTool(null);
  };

  return (
    <>
      <Helmet>
        <title>Free Tools - Ruvab IT | Productivity Utilities</title>
        <meta
          name="description"
          content="Access a collection of free tools and utilities to boost your productivity and streamline your workflow."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12">
          {/* Navigation */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="ghost" className="flex items-center gap-2" data-testid="button-home">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="ghost" className="flex items-center gap-2" data-testid="button-services">
                  <Briefcase className="w-4 h-4" />
                  Services
                </Button>
              </Link>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full mb-4">
              <Wrench className="w-5 h-5" />
              <span className="font-semibold">Free Tools Collection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Productivity Tools
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our collection of free, powerful tools to enhance your workflow and boost productivity.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading tools...</span>
            </div>
          )}

          {/* Tools Grid */}
          {!isLoading && tools && tools.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card
                  key={tool.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400 dark:hover:border-purple-500"
                  onClick={() => handleToolClick(tool)}
                  data-testid={`card-tool-${tool.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors">
                        {tool.title}
                      </CardTitle>
                      <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-purple-400 transition-colors" />
                    </div>
                    {tool.category && (
                      <Badge
                        variant="secondary"
                        className="w-fit bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-700 dark:text-purple-300"
                      >
                        {tool.category}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {tool.description || "Click to view and use this tool"}
                    </CardDescription>
                    <Button
                      variant="ghost"
                      className="mt-4 w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:text-white transition-all"
                      data-testid={`button-open-tool-${tool.id}`}
                    >
                      Open Tool
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && tools && tools.length === 0 && (
            <div className="text-center py-20">
              <Wrench className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Tools Available Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                New tools will be added soon. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tool Preview Dialog */}
      <Dialog open={!!selectedTool} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedTool?.title}</DialogTitle>
            {selectedTool?.description && (
              <p className="text-gray-600 dark:text-gray-400">{selectedTool.description}</p>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-lg">
            {selectedTool && (
              <iframe
                srcDoc={selectedTool.htmlCode}
                title={selectedTool.title}
                className="w-full h-full min-h-[500px]"
                sandbox="allow-scripts allow-same-origin"
                data-testid="iframe-tool-preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
