import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const res = await api.post('/auth/refresh');
    if (res.data && res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    setUser(res.data.user || null);
    return res.data;
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
  };

  const login = async ({ role, email, password }) => {
    const path = role === 'admin' ? '/auth/admin/login' : `/auth/${role}/login`;
    const res = await api.post(path, { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      if (!patch || typeof patch !== 'object') return prev;
      return { ...prev, ...patch };
    });
  }, []);

  const register = async (payload) => {
    const { role } = payload;
    const path = role === 'doctor' ? '/auth/doctor/register' : '/auth/patient/register';

    const body = role === 'doctor'
      ? {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          title: payload.title,
          phone: payload.phone,
          gender: payload.gender,
          dob: payload.dob,
          age: payload.age,
          specialization: payload.specialization,
          experienceYears: payload.experienceYears,
          consultationFees: payload.consultationFees,
          clinicCountry: payload.clinicCountry,
          clinicState: payload.clinicState,
          clinicCity: payload.clinicCity,
          clinicAddress: payload.clinicAddress,
        }
      : {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          title: payload.title,
          phone: payload.phone,
          gender: payload.gender,
          dob: payload.dob,
          age: payload.age,
          locationCountry: payload.locationCountry,
          locationState: payload.locationState,
          locationCity: payload.locationCity,
        };

    for (const k of Object.keys(body)) {
      if (typeof body[k] === 'undefined') delete body[k];
    }

    const res = await api.post(path, body);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (e) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
      updateUser,
    }),
    [user, loading, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
