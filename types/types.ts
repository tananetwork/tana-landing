import React from 'react'

export interface nLayout {
    children: React.ReactNode
  }

export interface authenticatedUser {
    id: string
    email?: string
}

export interface iconProps {
  size: string
}

export interface MenuItemProps {
  url: string
  title?: string
  size?: string
  children?: React.ReactNode
}

export type errorMessage = {
  code: number
  message: string
}

// theme
export type Theme = 'dark' | 'light'

export enum ThemeOptions {
  dark = 'dark',
  light = 'light',
  system = 'system'
}

export type ThemeContext = {
    theme: Theme
    setTheme: React.Dispatch<React.SetStateAction<Theme>>
}

export type ThemeContextProviderProps = {
    children: React.ReactNode
    initialTheme: Theme
}

export interface ThemeEav {
  data: Theme | null
  error: errorMessage | null
}

// auth
export type Auth = {
                    'id': string, 
                    'username': string,
                    'profilepic': string,
                    'type': string,
                    'created_at': string,
                    'theme': Theme,
                    'lang': Lang,
                    'setup_step': boolean,
                  } | null

export type AuthContext = {
    auth: Profile
    setAuth: React.Dispatch<React.SetStateAction<Profile>>
}

export type AuthContextProviderProps = {
    children: React.ReactNode
    authState: Profile
}

export interface AuthEav {
  data: Profile | null
  error: errorMessage | null
}

// profile
export interface Profile {
  id: string
  username?: string
  profilepic?: string
  type?: string
  theme?: Theme
  lang?: Lang
  setup_step?: number
  created_at: string
}

export interface ProfileEav {
  data: Profile | null
  error: errorMessage | null
}

// projects
export type Projects = {
                    'created_at': string,
                    'project_id': string, 
                    'name': string,
                    'template': string,
                    'type': string,
                    'slug': string,
                    'internal_domain': string,
                    'dns_domain': string,
                    'region': string,
                    'instance1': string,
                    'instance2': string,
                    'instance3': string
                  }[] | null

export interface ProjectsEav {
  data: Projects | null
  error: errorMessage | null
}

export type ProjectsContext = {
    projects: Projects
    setProjects: React.Dispatch<React.SetStateAction<Projects>>
}

export type ProjectsContextProviderProps = {
    children: React.ReactNode
    projectsState: Projects
}

// lang
export type Lang = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt'

export interface LangEav {
  data: Lang | null
  action: Function | null
  error: errorMessage | null
}

// steps
export interface StepsEav {
  data: number | null
  action: Function | null
  error: errorMessage | null
}