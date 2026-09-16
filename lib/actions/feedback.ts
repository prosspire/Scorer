"use server"

import { createSupabaseServerClient } from "@/lib/supabase";

export async function submitFeedback(type: string, message: string) {
    const supabase = await createSupabaseServerClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new Error("You must be logged in to submit feedback");
    }

    // Insert into user_feedback table
    const { data, error } = await supabase
        .from("user_feedback")
        .insert({
            user_id: user.id,
            feedback_type: type,
            message: message,
        })
        .select()
        .single();

    if (error) {
        console.error("Error submitting feedback:", error);
        throw new Error(error.message);
    }

    return data;
}
