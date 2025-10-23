<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pengingat Nobar</title>
  </head>
  <body style="font-family: 'Figtree', Arial, sans-serif; background-color: #fdf2f8; color: #0f172a; margin: 0; padding: 0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="padding: 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background: #ffffff; border-radius: 18px; padding: 32px; box-shadow: 0 24px 60px rgba(236, 72, 153, 0.12);">
            <tr>
              <td style="text-align: center; padding-bottom: 24px;">
                <h1 style="margin: 0; color: #ec4899; font-size: 24px; letter-spacing: 0.08em; text-transform: uppercase;">MySpaceLove</h1>
                <p style="margin: 8px 0 0; font-size: 16px; color: #475569;">Pengingat Nobar</p>
              </td>
            </tr>
            <tr>
              <td style="font-size: 16px; line-height: 1.6; color: #334155;">
                <p style="margin-top: 0;">
                  Halo {{ $recipientName ? e($recipientName) : 'Sahabat MySpaceLove' }},
                </p>
                <p>
                  Jadwal nobar untuk ruang <strong>{{ $space->title ?? 'MySpaceLove' }}</strong> sudah dibuat. Simpan pengingat ini supaya kalian bisa bergabung tepat waktu.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0; background: #fdf2f8; border-radius: 16px; padding: 20px;">
                  <tr>
                    <td style="color: #9d174d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; font-size: 12px;">Detail Nobar</td>
                  </tr>
                  <tr>
                    <td style="padding-top: 12px;">
                      <p style="margin: 0; color: #0f172a;"><strong>Waktu Mulai:</strong> {{ $formattedStart ?? 'Segera' }} ({{ $timezone }})</p>
                      @if($formattedEnd)
                        <p style="margin: 4px 0 0; color: #0f172a;"><strong>Perkiraan Selesai:</strong> {{ $formattedEnd }} ({{ $timezone }})</p>
                      @endif
                      <p style="margin: 12px 0 0; color: #0f172a;"><strong>Ruangan:</strong> {{ $schedule->room_name ?? $schedule->room_id }}</p>
                      <p style="margin: 4px 0 0; color: #0f172a;"><strong>ID Ruangan:</strong> {{ $schedule->room_id }}</p>
                    </td>
                  </tr>
                </table>
                <p>
                  Saat waktunya tiba, klik tombol di bawah ini lalu masuk menggunakan akun MySpaceLove kalian.
                </p>
                <p style="text-align: center; margin: 32px 0;">
                  <a href="{{ $joinUrl }}" style="display: inline-block; background: #ec4899; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;">Masuk ke Nobar</a>
                </p>
                <p style="margin-bottom: 0;">
                  Sampai ketemu di ruang nobar!<br />
                  <strong>Tim MySpaceLove</strong>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
