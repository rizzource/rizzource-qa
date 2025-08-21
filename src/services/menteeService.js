import { supabase } from "@/integrations/supabase/client";

export const createMentee = async (menteeData) => {
  try {
    const { data, error } = await supabase
      .from('mentees')
      .insert([menteeData])
      .select();

    if (error) {
      throw error;
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error creating mentee:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to submit mentee application' 
    };
  }
};

export const getAllMentees = async () => {
  try {
    const { data, error } = await supabase
      .from('mentees')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching mentees:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch mentees' 
    };
  }
};