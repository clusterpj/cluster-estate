"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase-browser";

const settingsFormSchema = z.object({
  emailNotifications: z.boolean(),
  bookingReminders: z.boolean(),
  marketingEmails: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export default function SettingsPage() {
  const t = useTranslations();
  const { user, userProfile, refreshProfile } = useAuth();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      emailNotifications: userProfile?.settings?.emailNotifications ?? true,
      bookingReminders: userProfile?.settings?.bookingReminders ?? true,
      marketingEmails: userProfile?.settings?.marketingEmails ?? false,
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          settings: data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success(t("dashboard.settings.updateSuccess"));
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(t("dashboard.settings.updateError"));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.settings.notifications")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("dashboard.settings.emailNotifications")}
                      </FormLabel>
                      <FormDescription>
                        {t("dashboard.settings.emailNotificationsDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bookingReminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("dashboard.settings.bookingReminders")}
                      </FormLabel>
                      <FormDescription>
                        {t("dashboard.settings.bookingRemindersDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("dashboard.settings.marketingEmails")}
                      </FormLabel>
                      <FormDescription>
                        {t("dashboard.settings.marketingEmailsDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("dashboard.settings.saveChanges")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}