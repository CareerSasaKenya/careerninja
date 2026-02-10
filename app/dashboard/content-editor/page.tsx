"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, RefreshCw } from "lucide-react";

interface PageContent {
  id: string;
  page_slug: string;
  section_key: string;
  content_type: string;
  content_value: string;
  metadata: Record<string, any>;
}

const PAGES = [
  { value: "home", label: "Homepage" },
  { value: "services-cv", label: "CV Services" },
  { value: "services-linkedin", label: "LinkedIn Services" },
  { value: "services-cover-letter", label: "Cover Letter Services" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
];

const CONTENT_TYPES = [
  { value: "text", label: "Text" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "number", label: "Number" },
];

export default function ContentEditorPage() {
  const [selectedPage, setSelectedPage] = useState("home");
  const [editingItem, setEditingItem] = useState<PageContent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch content for selected page
  const { data: pageContent = [], isLoading, refetch } = useQuery({
    queryKey: ["page-content-admin", selectedPage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", selectedPage)
        .order("section_key");

      if (error) throw error;
      return data as PageContent[];
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (item: PageContent) => {
      const { error } = await supabase
        .from("page_content")
        .update({
          content_value: item.content_value,
          content_type: item.content_type,
          metadata: item.metadata,
        })
        .eq("id", item.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content-admin", selectedPage] });
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
      toast.success("Content updated successfully!");
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (item: Partial<PageContent>) => {
      const { error } = await supabase.from("page_content").insert({
        page_slug: selectedPage,
        section_key: item.section_key,
        content_type: item.content_type || "text",
        content_value: item.content_value || "",
        metadata: item.metadata || {},
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content-admin", selectedPage] });
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
      toast.success("Content created successfully!");
      setIsCreating(false);
      setEditingItem(null);
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("page_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content-admin", selectedPage] });
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
      toast.success("Content deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (!editingItem) return;

    if (isCreating) {
      createMutation.mutate(editingItem);
    } else {
      updateMutation.mutate(editingItem);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteMutation.mutate(id);
    }
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingItem({
      id: "",
      page_slug: selectedPage,
      section_key: "",
      content_type: "text",
      content_value: "",
      metadata: {},
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Content Editor</h1>
            <p className="text-muted-foreground">
              Edit content for all front-facing pages without touching code
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Panel - Page Selection & Content List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Select Page</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refetch()}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedPage} onValueChange={setSelectedPage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGES.map((page) => (
                        <SelectItem key={page.value} value={page.value}>
                          {page.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Content Sections</h3>
                      <Button size="sm" onClick={startCreating}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>

                    {isLoading ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : pageContent.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No content yet. Click Add to create.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {pageContent.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setEditingItem(item);
                              setIsCreating(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              editingItem?.id === item.id
                                ? "bg-primary/10 border-primary"
                                : "bg-card hover:bg-accent border-border"
                            }`}
                          >
                            <div className="font-medium text-sm">{item.section_key}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.content_type}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Content Editor */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isCreating ? "Create New Content" : editingItem ? "Edit Content" : "Select a section to edit"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editingItem ? (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="section_key">Section Key</Label>
                        <Input
                          id="section_key"
                          value={editingItem.section_key}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, section_key: e.target.value })
                          }
                          placeholder="e.g., hero_title, stats_jobs"
                          disabled={!isCreating}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Unique identifier for this content section
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="content_type">Content Type</Label>
                        <Select
                          value={editingItem.content_type}
                          onValueChange={(value) =>
                            setEditingItem({ ...editingItem, content_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONTENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="content_value">Content Value</Label>
                        <Textarea
                          id="content_value"
                          value={editingItem.content_value}
                          onChange={(e) =>
                            setEditingItem({ ...editingItem, content_value: e.target.value })
                          }
                          rows={editingItem.content_type === "html" || editingItem.content_type === "json" ? 10 : 5}
                          placeholder="Enter your content here..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="metadata">Metadata (JSON)</Label>
                        <Textarea
                          id="metadata"
                          value={JSON.stringify(editingItem.metadata, null, 2)}
                          onChange={(e) => {
                            try {
                              const parsed = JSON.parse(e.target.value);
                              setEditingItem({ ...editingItem, metadata: parsed });
                            } catch {
                              // Invalid JSON, don't update
                            }
                          }}
                          rows={4}
                          placeholder='{"key": "value"}'
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Additional data like images, links, etc.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleSave}
                          disabled={updateMutation.isPending || createMutation.isPending}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isCreating ? "Create" : "Save Changes"}
                        </Button>

                        {!isCreating && (
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(editingItem.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingItem(null);
                            setIsCreating(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>Select a content section from the left panel to edit</p>
                      <p className="text-sm mt-2">or click Add to create new content</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview Card */}
              {editingItem && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      {editingItem.content_type === "html" ? (
                        <div dangerouslySetInnerHTML={{ __html: editingItem.content_value }} />
                      ) : editingItem.content_type === "json" ? (
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(JSON.parse(editingItem.content_value || "{}"), null, 2)}
                        </pre>
                      ) : (
                        <p>{editingItem.content_value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
