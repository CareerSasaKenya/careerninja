"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Palette, Upload, Loader2 } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

interface BrandingFormData {
  site_name: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
}

const BrandingSettings = () => {
  const { branding, refreshBranding } = useBranding();
  const [formData, setFormData] = useState<BrandingFormData>({
    site_name: "",
    logo_url: "",
    favicon_url: "",
    primary_color: "#8B5CF6",
    secondary_color: "#EC4899",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "favicon" | null>(null);

  // Update form data when branding changes
  useEffect(() => {
    if (branding) {
      setFormData({
        site_name: branding.site_name || "",
        logo_url: branding.logo_url || "",
        favicon_url: branding.favicon_url || "",
        primary_color: branding.primary_color || "#8B5CF6",
        secondary_color: branding.secondary_color || "#EC4899",
      });
    }
  }, [branding]);

  const handleFileUpload = async (file: File, type: "logo" | "favicon") => {
    setUploading(type);
    
    // For favicon, ensure we have the right extension
    let fileExt = file.name.split(".").pop();
    if (type === "favicon" && !fileExt) {
      fileExt = "ico"; // Default to .ico for favicons
    }
    
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `branding/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("public")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error(`Failed to upload ${type}`);
      setUploading(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("public")
      .getPublicUrl(filePath);

    setFormData((prev) => ({
      ...prev,
      [`${type}_url`]: publicUrl,
    }));

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
    setUploading(null);
    
    // For immediate preview, we refresh branding right after upload
    if (type === "favicon") {
      setTimeout(() => refreshBranding(), 500); // Small delay to ensure file is available
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("site_settings")
      .update({
        site_name: formData.site_name,
        logo_url: formData.logo_url || null,
        favicon_url: formData.favicon_url || null,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
      })
      .eq("id", branding?.id);

    if (error) {
      toast.error("Failed to update branding settings: " + error.message);
      setLoading(false);
      return;
    }

    toast.success("Branding settings updated successfully");
    // Refresh branding to ensure all components update
    await refreshBranding();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Branding Settings
        </CardTitle>
        <CardDescription>
          Customize your website's appearance, logo, and brand colors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Site Name */}
          <div className="space-y-2">
            <Label htmlFor="site_name">Site Name</Label>
            <Input
              id="site_name"
              value={formData.site_name}
              onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
              placeholder="CareerSasa"
              required
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>
            <div className="flex items-center gap-4">
              {formData.logo_url && (
                <img
                  src={formData.logo_url}
                  alt="Logo preview"
                  className="h-12 w-12 object-contain rounded border"
                />
              )}
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "logo");
                  }}
                  disabled={uploading === "logo"}
                />
              </div>
              {uploading === "logo" && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <p className="text-sm text-muted-foreground">
              Recommended: Square image, at least 200x200px
            </p>
          </div>

          {/* Favicon Upload */}
          <div className="space-y-2">
            <Label htmlFor="favicon">Favicon</Label>
            <div className="flex items-center gap-4">
              {formData.favicon_url && (
                <img
                  src={formData.favicon_url}
                  alt="Favicon preview"
                  className="h-8 w-8 object-contain rounded border"
                />
              )}
              <div className="flex-1">
                <Input
                  id="favicon"
                  type="file"
                  accept="image/x-icon,image/png,image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "favicon");
                  }}
                  disabled={uploading === "favicon"}
                />
              </div>
              {uploading === "favicon" && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            <p className="text-sm text-muted-foreground">
              Recommended: .ico or .png file, 32x32px or 64x64px
            </p>
          </div>

          {/* Color Scheme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  placeholder="#EC4899"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <Label>Color Preview</Label>
            <div className="flex gap-4 p-4 border rounded-lg">
              <div
                className="w-20 h-20 rounded-lg shadow-md"
                style={{ backgroundColor: formData.primary_color }}
              />
              <div
                className="w-20 h-20 rounded-lg shadow-md"
                style={{ backgroundColor: formData.secondary_color }}
              />
              <div
                className="flex-1 h-20 rounded-lg shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`,
                }}
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Branding Settings"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BrandingSettings;