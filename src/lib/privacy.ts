/**
 * MASKING UTILITY FOR DIRECTORY VIEWS
 * Shields user data based on their privacy preferences
 */

export interface PrivacyConfig {
  directoryVisibility?: 'full' | 'partial' | 'hidden';
  directoryHiddenFields?: string[];
  [key: string]: any;
}

export function maskProfileForDirectory(profile: any) {
  if (profile.directoryVisibility === 'hidden') {
    return null;
  }

  if (profile.directoryVisibility === 'partial') {
    const hiddenFields = profile.directoryHiddenFields || [];
    const masked = { ...profile };

    if (hiddenFields.includes('phone')) {
      masked.phone = 'Hidden';
      if (masked.socials && masked.socials.whatsapp) {
        masked.socials.whatsapp = 'Hidden';
      }
    }

    if (hiddenFields.includes('email')) {
      masked.email = 'Contact Privately';
    }

    if (hiddenFields.includes('company')) {
      masked.company = 'Confidential';
    }

    if (hiddenFields.includes('location')) {
      masked.address = 'Private';
      masked.city = 'Private';
      masked.location = 'Private';
    }

    if (hiddenFields.includes('name')) {
      masked.name = 'Private Profile';
      masked.avatar = '??';
    }

    return masked;
  }

  return profile;
}
