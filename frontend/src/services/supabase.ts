import { createClient, SupabaseClient, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { User, UserRole, Watershed, Intervention, FieldEvidence } from '../types';
import { fallbackWatersheds, fallbackInterventions, fallbackEvidence } from '../data/mockFallback';

// Read environment variables
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth mapping helper
export function mapSupabaseUserToAppUser(sbUser: SupabaseAuthUser, profile?: any): User {
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email || 'officer@jaldrishti.gov.in',
    full_name: profile?.full_name || meta.full_name || meta.name || sbUser.email?.split('@')[0] || 'Department Officer',
    role: (profile?.role || meta.role || 'district_officer') as UserRole,
    district: profile?.district || meta.district || 'Rajkot',
    state: profile?.state || meta.state || 'Gujarat'
  };
}

// Supabase Authentication Methods
export const supabaseAuth = {
  async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Falling back to platform auth.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user || !data.session) throw new Error('Authentication failed');

    // Query user profile if available
    let profile = null;
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      profile = prof;
    } catch {
      // Profile table might not exist yet
    }

    const appUser = mapSupabaseUserToAppUser(data.user, profile);
    return {
      user: appUser,
      token: data.session.access_token
    };
  },

  async signUp(params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    district: string;
    state: string;
  }): Promise<{ user: User; token: string | null }> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('Supabase is not configured');
    }

    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          role: params.role,
          district: params.district,
          state: params.state
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Registration failed');

    // Upsert to profiles table
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: params.email,
        full_name: params.fullName,
        role: params.role,
        district: params.district,
        state: params.state,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not upsert to profiles table:', e);
    }

    const appUser = mapSupabaseUserToAppUser(data.user, {
      full_name: params.fullName,
      role: params.role,
      district: params.district,
      state: params.state
    });

    return {
      user: appUser,
      token: data.session?.access_token || null
    };
  },

  async signOut(): Promise<void> {
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  async getSession(): Promise<{ user: User; token: string } | null> {
    if (!supabase || !isSupabaseConfigured) return null;
    const { data } = await supabase.auth.getSession();
    if (!data?.session?.user) return null;

    let profile = null;
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      profile = prof;
    } catch {
      // ignore
    }

    return {
      user: mapSupabaseUserToAppUser(data.session.user, profile),
      token: data.session.access_token
    };
  }
};

// Supabase Database Data Methods
export const supabaseDb = {
  async getWatersheds(): Promise<Watershed[]> {
    if (!supabase || !isSupabaseConfigured) return fallbackWatersheds;
    try {
      const { data, error } = await supabase
        .from('watersheds')
        .select('*')
        .order('name');
      if (error || !data || data.length === 0) return fallbackWatersheds;
      return data as Watershed[];
    } catch {
      return fallbackWatersheds;
    }
  },

  async getInterventions(watershedId?: string): Promise<Intervention[]> {
    if (!supabase || !isSupabaseConfigured) {
      if (watershedId) {
        return fallbackInterventions.filter(i => i.watershed_id === watershedId);
      }
      return fallbackInterventions;
    }
    try {
      let query = supabase.from('interventions').select('*');
      if (watershedId) {
        query = query.eq('watershed_id', watershedId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return watershedId 
          ? fallbackInterventions.filter(i => i.watershed_id === watershedId)
          : fallbackInterventions;
      }
      return data as Intervention[];
    } catch {
      return fallbackInterventions;
    }
  },

  async createEvidence(evidence: Partial<FieldEvidence>): Promise<FieldEvidence> {
    if (!supabase || !isSupabaseConfigured) {
      const newEv = {
        ...evidence,
        id: `ev-${Date.now()}`,
        created_at: new Date().toISOString()
      } as FieldEvidence;
      return newEv;
    }

    const { data, error } = await supabase
      .from('field_evidence')
      .insert([evidence])
      .select()
      .single();

    if (error) throw error;
    return data as FieldEvidence;
  },

  async getEvidence(interventionId?: string): Promise<FieldEvidence[]> {
    if (!supabase || !isSupabaseConfigured) {
      if (interventionId) {
        return fallbackEvidence.filter(e => e.intervention_id === interventionId);
      }
      return fallbackEvidence;
    }

    try {
      let query = supabase.from('field_evidence').select('*').order('created_at', { ascending: false });
      if (interventionId) {
        query = query.eq('intervention_id', interventionId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) return fallbackEvidence;
      return data as unknown as FieldEvidence[];
    } catch {
      return fallbackEvidence;
    }
  }
};
