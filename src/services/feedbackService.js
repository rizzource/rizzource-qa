import { supabase } from "@/integrations/supabase/client";

export const createFeedback = async (feedbackData) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert([feedbackData])
      .select();

    if (error) {
      throw error;
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error creating feedback:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to submit feedback' 
    };
  }
};

export const getAllFeedback = async () => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch feedback' 
    };
  }
};