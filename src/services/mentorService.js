import { supabase } from "@/integrations/supabase/client";

export const createMentor = async (mentorData) => {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .insert([mentorData])
      .select();

    if (error) {
      throw error;
    }

    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Error creating mentor:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to submit mentor application' 
    };
  }
};

export const getAllMentors = async () => {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch mentors' 
    };
  }
};