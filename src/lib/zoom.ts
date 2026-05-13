const ZOOM_API = 'https://api.zoom.us/v2';

export interface ZoomMeeting {
  id: string;
  joinUrl: string;
  startUrl: string;
  password: string;
}

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
  ).toString('base64');

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    { method: 'POST', headers: { Authorization: `Basic ${credentials}` } },
  );

  if (!res.ok) throw new Error(`Zoom token error: ${res.status}`);
  const data = await res.json();
  return data.access_token as string;
}

export async function createZoomMeeting(
  topic: string,
  startTime: Date,
  durationMinutes: number,
): Promise<ZoomMeeting> {
  const token = await getAccessToken();

  const res = await fetch(`${ZOOM_API}/users/me/meetings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2, // scheduled
      start_time: startTime.toISOString(),
      duration: durationMinutes,
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,
        join_before_host: false,
        auto_recording: 'cloud',
      },
    }),
  });

  if (!res.ok) throw new Error(`Zoom meeting creation failed: ${res.status}`);
  const data = await res.json();

  return {
    id: String(data.id),
    joinUrl: data.join_url,
    startUrl: data.start_url,
    password: data.password,
  };
}

export async function deleteZoomMeeting(meetingId: string): Promise<void> {
  const token = await getAccessToken();
  await fetch(`${ZOOM_API}/meetings/${meetingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
