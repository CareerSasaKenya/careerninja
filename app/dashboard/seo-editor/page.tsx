"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Search, Globe, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PageSEO {
  id: string;
  page_slug: string;
  section_key: string;
  seo_title: string | null;
  seo_meta_description: string | null;
  seo_url_slug: string | null;
  seo_canonical_url: string | null;
  seo_index: boolean | null;
  seo_h1_title: string | null;
  seo_follow: boolean | null;
}

const PAGES = [
  { slug: "home", label: "Homepage", defaultUrl: "/", defaultCanonical: "https://www.careersasa.co.ke/" },
  { slug: "services-cv", label: "CV Services", defaultUrl: "/services/cv", defaultCanonical: "https://www.careersasa.co.ke/services/cv" },
  { slug: "services-linkedin", label: "LinkedIn Services", defaultUrl: "/services/linkedin", defaultCanonical: "https://www.careersasa.co.ke/services/linkedin" },
  { slug: "services-cover-letter", label: "Cover Letter Services", defaultUrl: "/services/cover-letter", defaultCanonical: "https://www.careersasa.co.ke/services/cover-letter" },
  { slug: "about", label: "About Page", defaultUrl: "/about", defaultCanonical: "https://www.careersasa.co.ke/about" },
  { slug: "contact", label: "Contact Page", defaultUrl: "/contact", defaultCanonical: "https://www.careersasa.co.ke/contact" },
];

export default function SEOEditorPage() {
  const [selectedPage, setSelectedPage] = useState("home");
  const queryClient = useQueryClient();

  const currentPage = PAGES.find(p => p.slug === selectedPage);

  // Fetch SEO data for selected page
  const { data: pageSEO, isLoading } = useQuery({
    queryKey: ["page-seo", selectedPage],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", selectedPage)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as PageSEO | null;
    },
  });

  const [formData, setFormData] = useState<Partial<PageSEO>>({});

  // Update form when data loads
  useState(() => {
    if (pageSEO) {
      setFormData({
        seo_title: pageSEO.seo_title || "",
        seo_meta_description: pageSEO.seo_meta_description || "",
        seo_url_slug: pageSEO.seo_url_slug || currentPage?.defaultUrl || "",
        seo_canonical_url: pageSEO.seo_canonical_url || currentPage?.defaultCanonical || "",
        seo_index: pageSEO.seo_index ?? true,
        seo_h1_title: pageSEO.seo_h1_title || "",
        seo_follow: pageSEO.seo_follow ?? true,
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!pageSEO?.id) {
        throw new Error("No SEO data found for this page");
      }

      const { error } = await supabase
        .from("page_content")
        .update({
          seo_title: formData.seo_title,
          seo_meta_description: formData.seo_meta_description,
          seo_url_slug: formData.seo_url_slug,
          seo_canonical_url: formData.seo_canonical_url,
          seo_index: formData.seo_index,
          seo_h1_title: formData.seo_h1_title,
          seo_follow: formData.seo_follow,
        })
        .eq("id", pageSEO.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page-seo"] });
      toast.success("SEO settings saved successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const handleSave = () => {
    updateMutation.mutate();
  };

  const titleLength = formData.seo_title?.length || 0;
  const descLength = formData.seo_meta_description?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Search className="h-8 w-8" />
          SEO Manager
        </h1>
        <p className="text-muted-foreground">
          Optimize your pages for search engines - control titles, descriptions, and indexing
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
          <TabsContent key={page.slug} value={page.slug}>
            {isLoading ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">Loading SEO settings...</p>
                </CardContent>
              </Card>
            ) : !pageSEO ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    No content found for this page. Please add content in the Content Editor first.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Search Preview */}
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Google Search Preview
                    </CardTitle>
                    <CardDescription>How your page will appear in search results</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white dark:bg-gray-900 p-4 rounded border">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {formData.seo_canonical_url || page.defaultCanonical}
                      </div>
                      <div className="text-xl text-blue-600 dark:text-blue-400 mb-1 font-medium">
                        {formData.seo_title || "Your SEO Title Here"}
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {formData.seo_meta_description || "Your meta description will appear here..."}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      SEO Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* SEO Title */}
                    <div>
                      <Label htmlFor="seo-title">SEO Title *</Label>
                      <Input
                        id="seo-title"
                        value={formData.seo_title || ""}
                        onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                        placeholder="Controls the clickable headline in Google search results"
                        className="mt-2"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground">
                          The title that appears in search engine results
                        </p>
                        <span className={`text-xs ${titleLength > 60 ? 'text-red-500' : titleLength > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {titleLength} / 60 characters
                        </span>
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <Label htmlFor="meta-desc">Meta Description *</Label>
                      <Textarea
                        id="meta-desc"
                        value={formData.seo_meta_description || ""}
                        onChange={(e) => setFormData({ ...formData, seo_meta_description: e.target.value })}
                        placeholder="Short summary shown under the title in search results to improve click-through rate"
                        rows={3}
                        className="mt-2"
                      />
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-muted-foreground">
                          Brief description that appears below the title in search results
                        </p>
                        <span className={`text-xs ${descLength > 160 ? 'text-red-500' : descLength > 150 ? 'text-yellow-500' : 'text-green-500'}`}>
                          {descLength} / 160 characters
                        </span>
                      </div>
                    </div>

                    {/* H1 Title */}
                    <div>
                      <Label htmlFor="h1-title">H1 Title</Label>
                      <Input
                        id="h1-title"
                        value={formData.seo_h1_title || ""}
                        onChange={(e) => setFormData({ ...formData, seo_h1_title: e.target.value })}
                        placeholder="Main heading for search engines"
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        The single, clear main heading for the page (usually matches your page title)
                      </p>
                    </div>

                    {/* URL Slug */}
                    <div>
                      <Label htmlFor="url-slug">URL Slug</Label>
                      <Input
                        id="url-slug"
                        value={formData.seo_url_slug || ""}
                        onChange={(e) => setFormData({ ...formData, seo_url_slug: e.target.value })}
                        placeholder="/page-url-slug"
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        The clean, readable URL path for this page
                      </p>
                    </div>

                    {/* Canonical URL */}
                    <div>
                      <Label htmlFor="canonical">Canonical URL</Label>
                      <Input
                        id="canonical"
                        value={formData.seo_canonical_url || ""}
                        onChange={(e) => setFormData({ ...formData, seo_canonical_url: e.target.value })}
                        placeholder="https://www.careersasa.co.ke/page-url"
                        className="mt-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Tells search engines which version of the page is the "main" one (prevents duplicate content issues)
                      </p>
                    </div>

                    {/* Index/Follow Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="index-toggle" className="text-base">
                            Index Page
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Allow this page to appear in search results
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {formData.seo_index ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <Switch
                            id="index-toggle"
                            checked={formData.seo_index ?? true}
                            onCheckedChange={(checked) => setFormData({ ...formData, seo_index: checked })}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <div className="space-y-0.5">
                          <Label htmlFor="follow-toggle" className="text-base">
                            Follow Links
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Allow search engines to follow links on this page
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {formData.seo_follow ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <Switch
                            id="follow-toggle"
                            checked={formData.seo_follow ?? true}
                            onCheckedChange={(checked) => setFormData({ ...formData, seo_follow: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="w-full"
                        size="lg"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {updateMutation.isPending ? "Saving..." : "Save SEO Settings"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
