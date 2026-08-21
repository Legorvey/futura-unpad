const fs = require('fs');
const content = fs.readFileSync('app/profile/page.tsx', 'utf8');

const jsxStart = content.indexOf('  return (\n    <div className="mx-auto w-full max-w-5xl">');

if (jsxStart === -1) {
    console.error('Could not find return statement');
    process.exit(1);
}

const beforeJsx = content.substring(0, jsxStart);

const newJsx = `  return (
    <div className="mx-auto w-full max-w-5xl profile-wrapper text-foreground">
      <style dangerouslySetInnerHTML={{ __html: \`
          .profile-wrapper {
              --background: #f1f5f9;
              --foreground: #0f172a;
              --card: #ffffff;
              --card-foreground: #0f172a;
              --popover: #ffffff;
              --popover-foreground: #0f172a;
              --primary: #2563eb;
              --primary-foreground: #ffffff;
              --secondary: #e2e8f0;
              --secondary-foreground: #0f172a;
              --muted: #f1f5f9;
              --muted-foreground: #64748b;
              --accent: #f1f5f9;
              --accent-foreground: #0f172a;
              --border: #e2e8f0;
              --input: #e2e8f0;
              --ring: #2563eb;
              --radius: 0.75rem;
          }
      \`}} />
      <div className="space-y-6">

        {/* SEMINAR */}
        <section className="bg-card text-card-foreground border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border bg-muted/30 p-5 sm:px-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">Seminar Nasional</h2>
              <p className="text-sm text-muted-foreground">
                {latestRegistration ? \`Terdaftar pada \${formatDate(latestRegistration.created_at)}\` : "Pendaftaran saat ini belum dibuka"}
              </p>
            </div>
            {latestRegistration && (
              <div className="flex items-center">
                <span className={\`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold \${checkedInCount > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}\`}>
                  {latestRegistration.registration_type === "group" ? \`\${checkedInCount}/\${totalParticipants} Hadir\` : (latestRegistration.attended ? "Hadir" : "Menunggu Kehadiran")}
                </span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {latestRegistration ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nama Peserta</p>
                  <p className="text-sm font-medium text-foreground">{latestRegistration.nama_lengkap}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Jenis Registrasi</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {latestRegistration.registration_type === "group" && latestRegistration.group_name
                      ? \`Grup (\${latestRegistration.group_name})\`
                      : latestRegistration.registration_type || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Status Kehadiran</p>
                  <p className="text-sm font-medium text-foreground">
                    {latestRegistration.registration_type === "group"
                      ? \`\${checkedInCount} dari \${totalParticipants} hadir\`
                      : latestRegistration.attended
                      ? \`Hadir (\${formatDate(latestRegistration.check_in_time)})\`
                      : "-"}
                  </p>
                </div>
                <div className="flex items-end justify-start sm:justify-end">
                  <Button asChild variant="outline" className="w-full sm:w-auto h-9 text-sm font-medium bg-background hover:bg-muted text-foreground border-border">
                    <Link href="/profile/seminar" prefetch={true}>Detail Seminar</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-lg font-medium text-foreground mb-2">Belum Terdaftar</p>
                <p className="text-sm text-muted-foreground max-w-md mb-6">Anda belum terdaftar dalam acara Seminar Nasional.</p>
                <Button asChild className="h-10 px-6 font-medium text-white shadow-sm bg-blue-600 hover:bg-blue-700">
                  <Link href="/seminar" prefetch={true}>Daftar Sekarang</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* MECHATURA */}
        <section className="bg-card text-card-foreground border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border bg-muted/30 p-5 sm:px-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">Mechatura</h2>
                {mechaturaTeam && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider border border-amber-200">
                    {mechaturaTeam.category.replace('_', ' ')}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {mechaturaTeam ? \`Terdaftar pada \${formatDate(mechaturaTeam.created_at)}\` : "Belum bergabung di tim manapun"}
              </p>
            </div>
            {mechaturaTeam && (
              <div className="flex items-center">
                <span className={\`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider \${
                  mechaturaTeam.submission_status === 'submitted'
                    ? mechaturaTeam.admin_approval_status === 'approved'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : mechaturaTeam.admin_approval_status === "revision"
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-slate-100 border-slate-200 text-slate-600'
                }\`}>
                  {mechaturaTeam.submission_status === 'submitted' ? (
                    mechaturaTeam.admin_approval_status === "approved" ? "DISETUJUI" : mechaturaTeam.admin_approval_status === "revision" ? "REVISI" : "PENDING"
                  ) : (
                    'DRAFT'
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            {mechaturaTeam ? (
              <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                {/* Left Column (Team Details) */}
                <div className="flex flex-wrap gap-x-12 gap-y-6 flex-1 w-full sm:w-auto">
                  {/* Team Name */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Nama Tim</h3>
                    <p className="text-sm font-medium text-foreground">{mechaturaTeam.name}</p>
                  </div>

                  {/* Role */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Peran</h3>
                    <p className="text-sm font-medium text-foreground">{mechaturaRoleText}</p>
                  </div>

                  {/* Capacity */}
                  <div className="min-w-[160px] max-w-[200px] flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kapasitas</h3>
                      <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                        <span>{mechaturaMemberCount} / 3</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: \`\${(mechaturaMemberCount / 3) * 100}%\` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column (Action) */}
                <div className="w-full sm:w-auto shrink-0 mt-4 sm:mt-0">
                  <Button asChild className="w-full h-10 px-6 font-medium text-white shadow-sm bg-blue-600 hover:bg-blue-700">
                    <Link href="/profile/mechatura" prefetch={true}>
                      Dashboard Tim <ChevronRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-lg font-medium text-foreground mb-2">Tim Belum Dibentuk</p>
                <p className="text-sm text-muted-foreground max-w-md mb-6">Anda belum membentuk tim atau bergabung dalam Kompetisi Robotika Mechatura.</p>
                <Button asChild className="h-10 px-6 font-medium text-white shadow-sm bg-blue-600 hover:bg-blue-700">
                  <Link href="/mechatura" prefetch={true}>Daftar Sekarang</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* LOMBA KTI */}
        <section className="bg-card text-card-foreground border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border bg-muted/30 p-5 sm:px-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1">Lomba Esai</h2>
              <p className="text-sm text-muted-foreground">
                Pendaftaran saat ini belum dibuka
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-lg font-medium text-foreground mb-2">Pendaftaran Belum Dibuka</p>
              <p className="text-sm text-muted-foreground max-w-md mb-6">Pendaftaran Lomba Esai saat ini belum dibuka. Lihat detail selengkapnya dengan mengklik tombol di bawah.</p>
              <Button asChild variant="outline" className="h-10 px-6 font-medium bg-background hover:bg-muted text-foreground border-border">
                <Link href="/lomba-esai" prefetch={true}>Lihat Detail Acara</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
`

fs.writeFileSync('app/profile/page.tsx', beforeJsx + newJsx);
console.log('Successfully replaced profile page JSX.');
