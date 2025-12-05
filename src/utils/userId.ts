// User identification using cookie + IP address

let cachedUserId: string | null = null;
let cachedIp: string | null = null;

export async function getUserId(): Promise<string> {
  if (cachedUserId) {
    return cachedUserId;
  }

  // Get or create cookie value
  const cookieValue = getOrCreateCookie();

  // Get IP address
  const ip = await getIpAddress();

  // Combine both to create unique user ID
  cachedUserId = `${cookieValue}_${ip}`;
  
  return cachedUserId;
}

function getOrCreateCookie(): string {
  const cookieName = 'mindfat_user_id';
  
  // Try to get existing cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return value;
    }
  }

  // Create new cookie value
  const newValue = generateRandomId();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 10); // 10 years
  
  document.cookie = `${cookieName}=${newValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
  
  return newValue;
}

async function getIpAddress(): Promise<string> {
  if (cachedIp) {
    return cachedIp;
  }

  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    cachedIp = data.ip;
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    // Fallback to a default value
    cachedIp = 'unknown';
    return 'unknown';
  }
}

function generateRandomId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
