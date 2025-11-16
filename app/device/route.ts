import { supabase_service } from '@/utils/supabase/server'
import { customAlphabet } from 'nanoid'

export async function POST(req: Request) {

  const sb = supabase_service()

  try {
    // Parse the incoming request body
    const { device_code, metadata } = await req.json();

    if (!device_code || !metadata) {
      return Response.json({ message: 'Missing device_code or user_code' }, { status: 400 });
    }

    // Handle the device code and user code logic
    // Example: store the codes in a database with an expiration time
    // You can also associate them with a user after the user logs in

    const userCode = generateUserCode()
    const meta_data = normalizeArray(metadata)

    // console.log('metadata: '+ JSON.stringify(normalizeArray(metadata)))
    // console.log('user code: '+ userCode)

    const { data, error } = await sb
                                    .from('device_auth')
                                    .insert({ 
                                              device_id: device_code,
                                              user_code: userCode,
                                              client_version: meta_data.client,
                                              machine_type: meta_data.machineType,
                                              os_version: meta_data.osVersion,
                                              machine_arch: meta_data.architecture,
                                              ip_fingerprint: meta_data.ipAddress
                                          })

    if (error) {
      throw error; // Handle insert errors
    }

    // For now, we just return a success message
    return Response.json({ device_code, userCode }, { status: 200 });
  } catch (error) {
    console.error('Error processing the device flow request:', error);
    return Response.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

function generateUserCode(): string {
  const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTVWXY2346789', 6)

  const code = nanoid();

  return code.toUpperCase();
}

function normalizeArray(arr: any): any {
  return arr.reduce((acc: any, item: any) => {
    const [key, value] = Object.entries(item)[0];
    acc[key] = value;
    return acc;
  }, {});
}