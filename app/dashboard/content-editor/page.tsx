"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Plus, Trash2, RefreshCw } from "lucide-react";

interface PageContent {
  id: string;
  page_slug: string;
  section_key: string;
  content_type: string;
  content_value: string;
  metadata: Record<string, any>;
  seo_title?: string | null;
  seo_meta_description?: string | null;
  seo_url_slug?: string | null;
  seo_canonical_url?: string | null;
  seo_index?: boolean | null;
  seo_h1_title?: string | null;
  seo_follow?: boolean | null;
}

const PAGES = [
  { slug: "home", label: "Homepage" },
  { slug: "services-cv", label: "CV Services" },
  { slug: "services-linkedin", label: "LinkedIn Services" },
  { slug: "services-cover-letter", label: "Cover Letter Services" },
  { slug: "about", label: "About Page" },
  { slug: "contact", label: "Contact Page" },
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
  const [newItem, setNewItem] = useState({
    section_key: "",
    content_type: "text",
    content_value: "",
    metadata: "{}",
  });

  const queryClient = useQueryClient();

  // Fetch content for selected page
  const { data: pageContent = [], isLoading } = useQuery({
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
          seo_title: item.seo_title,
          seo_meta_description: item.seo_meta_description,
          seo_url_slug: item.seo_url_slug,
          seo_canonical_url: item.seo_canonical_url,
          seo_index: item.seo_index,
          seo_h1_title: item.seo_h1_title,
          seo_follow: item.seo_follow,
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
    mutationFn: async () => {
      let metadata = {};
      try {
        metadata = JSON.parse(newItem.metadata);
      } catch (e) {
        throw new Error("Invalid JSON in metadata");
      }

      const { error } = await supabase.from("page_content").insert({
        page_slug: selectedPage,
        section_key: newItem.section_key,
        content_type: newItem.content_type,
        content_value: newItem.content_value,
        metadata,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-content-admin", selectedPage] });
      queryClient.invalidateQueries({ queryKey: ["page-content"] });
      toast.success("Content created successfully!");
      setNewItem({
        section_key: "",
        content_type: "text",
        content_value: "",
        metadata: "{}",
      });
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

  const handleSave = (item: PageContent) => {
    updateMutation.mutate(item);
  };

  const handleCreate = () => {
    if (!newItem.section_key || !newItem.content_value) {
      toast.error("Section key and content value are required");
      return;
    }
    createMutation.mutate();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Content Editor</h1>
        <p className="text-muted-foreground">
          Edit front-facing page content without touching code
        </p>
      </div>

      <Tabs value={selectedPage} onValueChange={setSelectedPage} className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {PAGES.map((page) => (
            <TabsTrigger key={page.slug} value={page.slug}>
              {page.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {PAGES.map((page) => (
          <TabsContent key={page.slug} value={page.slug} className="space-y-6">
            {/* Existing Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Existing Content Sections</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["page-content-admin"] })}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : pageContent.length === 0 ? (
                  <p className="text-muted-foreground">No content found for this page</p>
                ) : (
                  <div className="space-y-4">
                    {pageContent.map((item) => (
                      <Card key={item.id} className="border-2">
                        <CardContent className="pt-6">
                          {editingItem?.id === item.id ? (
                            <div className="space-y-4">
                              <div>
                                <Label>Section Key</Label>
                                <Input
                                  value={editingItem.section_key}
                                  disabled
                                  className="bg-muted"
                                />
                              </div>
                              <div>
                                <Label>Content Type</Label>
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
                                <Label>Content Value</Label>
                                <Textarea
                                  value={editingItem.content_value}
                                  onChange={(e) =>
                                    setEditingItem({
                                      ...editingItem,
                                      content_value: e.target.value,
                                    })
                                  }
                                  rows={6}
                                  className="font-mono text-sm"
                                />
                              </div>
                              <div>
                                <Label>Metadata (JSON)</Label>
                                <Textarea
                                  value={JSON.stringify(editingItem.metadata, null, 2)}
                                  onChange={(e) => {
                                    try {
                                      const parsed = JSON.parse(e.target.value);
                                      setEditingItem({ ...editingItem, metadata: parsed });
                                    } catch {
                                      // Invalid JSON, don't update
                                    }
                                  }}
                                  rows={3}
                                  className="font-mono text-sm"
                                />
                              </div>

                              {/* SEO Fields Section */}
                              <div className="border-t pt-4 mt-4">
                                <h3 className="font-semibold text-lg mb-4">SEO Settings</h3>
                                <div className="space-y-4">
                                  <div>
                                    <Label>SEO Title</Label>
                                    <Input
                                      value={editingItem.seo_title || ""}
                                      onChange={(e) =>
                                        setEditingItem({
                                          ...editingItem,
                                          seo_title: e.target.value,
                                        })
                                      }
                                      placeholder="Controls the clickable headline in Google search results"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Recommended: 50-60 characters
                                    </p>
                                  </div>

                                  <div>
                                    <Label>Meta Description</Label>
                                    <Textarea
                                      value={editingItem.seo_meta_description || ""}
                                      onChange={(e) =>
                                        setEditingItem({
                                          ...editingItem,
                                          seo_meta_description: e.target.value,
                                        })
                                      }
                                      placeholder="Short summary shown under the title in search results"
                                      rows={3}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Recommended: 150-160 characters
                                    </p>
                                  </div>

                                  <div>
                                    <Label>URL Slug</Label>
                                    <Input
                                      value={editingItem.seo_url_slug || ""}
                                      onChange={(e) =>
                                        setEditingItem({
                                          ...editingItem,
                                          seo_url_slug: e.target.value,
                                        })
                                      }
                                      placeholder="/page-url-slug"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Defines the clean, readable page URL
                                    </p>
                                  </div>

                                  <div>
                                    <Label>Canonical URL</Label>
                                    <Input
                                      value={editingItem.seo_canonical_url || ""}
                                      onChange={(e) =>
                                        setEditingItem({
                                          ...editingItem,
                                          seo_canonical_url: e.target.value,
                                        })
                                      }
                                      placeholder="https://www.careersasa.co.ke/page-url"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Tells search engines which version is the main one
                                    </p>
                                  </div>

                                  <div>
                                    <Label>H1 Title</Label>
                                    <Input
                                      value={editingItem.seo_h1_title || ""}
                                      onChange={(e) =>
                                        setEditingItem({
                                          ...editingItem,
                                          seo_h1_title: e.target.value,
                                        })
                                      }
                                      placeholder="Main heading for search engines"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                      The single, clear main heading for the page
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`index-${editingItem.id}`}
                                        checked={editingItem.seo_index ?? true}
                                        onChange={(e) =>
                                          setEditingItem({
                                            ...editingItem,
                                            seo_index: e.target.checked,
                                          })
                                        }
                                        className="h-4 w-4"
                                      />
                                      <Label htmlFor={`index-${editingItem.id}`}>
                                        Index (Allow in search results)
                                      </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`follow-${editingItem.id}`}
                                        checked={editingItem.seo_follow ?? true}
                                        onChange={(e) =>
                                          setEditingItem({
                                            ...editingItem,
                                            seo_follow: e.target.checked,
                                          })
                                        }
                                        className="h-4 w-4"
                                      />
                                      <Label htmlFor={`follow-${editingItem.id}`}>
                                        Follow (Follow links on page)
                                      </Label>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSave(editingItem)}
                                  disabled={updateMutation.isPending}
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingItem(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-lg">
                                      {item.section_key}
                                    </span>
                                    <span className="text-xs bg-muted px-2 py-1 rounded">
                                      {item.content_type}
                                    </span>
                                  </div>
                                  <div className="bg-muted p-3 rounded text-sm font-mono whitespace-pre-wrap break-words">
                                    {item.content_value.length > 200
                                      ? item.content_value.substring(0, 200) + "..."
                                      : item.content_value}
                                  </div>
                                  {Object.keys(item.metadata).length > 0 && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                      Metadata: {JSON.stringify(item.metadata)}
                                    </div>
                                  )}
                                  {(item.seo_title || item.seo_meta_description || item.seo_url_slug) && (
                                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                                      <div className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                        SEO Settings
                                      </div>
                                      {item.seo_title && (
                                        <div className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                                          <span className="font-medium">Title:</span> {item.seo_title}
                                        </div>
                                      )}
                                      {item.seo_meta_description && (
                                        <div className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                                          <span className="font-medium">Description:</span> {item.seo_meta_description}
                                        </div>
                                      )}
                                      {item.seo_url_slug && (
                                        <div className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                                          <span className="font-medium">URL:</span> {item.seo_url_slug}
                                        </div>
                                      )}
                                      {item.seo_h1_title && (
                                        <div className="text-xs text-blue-800 dark:text-blue-200 mb-1">
                                          <span className="font-medium">H1:</span> {item.seo_h1_title}
                                        </div>
                                      )}
                                      <div className="text-xs text-blue-800 dark:text-blue-200 flex gap-3 mt-1">
                                        <span>Index: {item.seo_index !== false ? "✓" : "✗"}</span>
                                        <span>Follow: {item.seo_follow !== false ? "✓" : "✗"}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingItem(item)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                    disabled={deleteMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add New Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Content Section
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Section Key *</Label>
                    <Input
                      placeholder="e.g., hero_title, cta_button_text"
                      value={newItem.section_key}
                      onChange={(e) =>
                        setNewItem({ ...newItem, section_key: e.target.value })
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use snake_case for consistency
                    </p>
                  </div>
                  <div>
                    <Label>Content Type</Label>
                    <Select
                      value={newItem.content_type}
                      onValueChange={(value) =>
                        setNewItem({ ...newItem, content_type: value })
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
                    <Label>Content Value *</Label>
                    <Textarea
                      placeholder="Enter your content here..."
                      value={newItem.content_value}
                      onChange={(e) =>
                        setNewItem({ ...newItem, content_value: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label>Metadata (JSON)</Label>
                    <Textarea
                      placeholder='{"key": "value"}'
                      value={newItem.metadata}
                      onChange={(e) => setNewItem({ ...newItem, metadata: e.target.value })}
                      rows={2}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Content Section
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
