import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseServer } from "@/integrations/supabase/supabase.server";

export const bypassSignup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    // We use the admin API to create the user and forcefully auto-confirm their email.
    // This completely bypasses the Supabase email confirmation requirement.
    const { data: user, error } = await supabaseServer.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.name },
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, userId: user.user.id };
  });
