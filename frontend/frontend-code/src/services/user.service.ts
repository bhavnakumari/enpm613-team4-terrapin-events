/**
 * User Service
 * Handles user profile-related API calls
 * 
 * Think of this as the "Student Records Department"
 * - Get your own profile
 * - Update your profile
 * - Look up other students
 */

import { apiClient } from '../lib/api-client';
import type { User } from '../types/auth';

/**
 * Update Profile Request
 * These are the fields you can change about yourself
 */
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  major?: string;
  year?: 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'faculty' | 'staff';
  pronouns?: string;
  phone?: string;
  address?: string;
  bio?: string;
}

export const userService = {
  /**
   * Get My Profile
   * 
   * What it does: Fetches YOUR profile data from the server
   * When to use: 
   * - When you want to refresh your profile
   * - To verify your login is still valid
   * - To show your profile page
   * 
   * Example:
   *   const myProfile = await userService.getMyProfile();
   *   console.log(myProfile.first_name); // "John"
   */
  async getMyProfile(): Promise<User> {
    return apiClient.get<User>('/api/users/me');
  },

  /**
   * Update My Profile
   * 
   * What it does: Updates YOUR profile information
   * When to use: When you edit your profile page
   * 
   * Example:
   *   await userService.updateMyProfile({
   *     major: 'Computer Science',
   *     bio: 'I love coding!'
   *   });
   */
  async updateMyProfile(data: UpdateProfileRequest): Promise<User> {
    return apiClient.patch<User>('/api/users/me', data);
  },

  /**
   * Get User By Directory ID
   * 
   * What it does: Looks up ANOTHER user's public profile
   * When to use:
   * - Viewing event organizer info
   * - Seeing who else registered for an event
   * 
   * Example:
   *   const organizer = await userService.getUserById('118234567');
   *   console.log(organizer.first_name); // "Jane"
   */
  async getUserById(directoryId: string): Promise<User> {
    return apiClient.get<User>(`/api/users/${directoryId}`);
  },
};
