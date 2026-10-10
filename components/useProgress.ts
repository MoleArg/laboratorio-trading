'use client';
import { useSyncExternalStore } from 'react';
import { getServerSnapshot, getSnapshot, subscribe } from '@/lib/progress';

export const useProgress = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
