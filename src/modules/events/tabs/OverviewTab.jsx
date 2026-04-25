import { StatCard } from '../../../components/index';

export default function OverviewTab({ event, stats }) {
  return (
    <div className="space-y-6 py-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Volunteers"
          value={stats?.volunteers ?? 0}
          icon="👥"
          color="primary"
        />
        <StatCard
          title="Tasks"
          value={stats?.tasks ?? 0}
          icon="✅"
          color="success"
        />
        <StatCard
          title="Budget"
          value={stats?.budget ? `₹${stats.budget.toLocaleString()}` : '₹0'}
          icon="💰"
          color="warning"
        />
      </div>

      {/* Event Description */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          About this Event
        </h3>
        <p className="text-slate-700 leading-relaxed">
          {event?.description || 'No description provided for this event.'}
        </p>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</h4>
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Date</dt>
              <dd className="text-sm font-medium text-slate-700">
                {event?.date
                  ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'TBA'}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Location</dt>
              <dd className="text-sm font-medium text-slate-700">{event?.location || 'TBA'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Type</dt>
              <dd className="text-sm font-medium text-slate-700 capitalize">{event?.type || '—'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-slate-500">Status</dt>
              <dd className="text-sm font-medium text-slate-700 capitalize">{event?.status || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Timeline</h4>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">Event Created</p>
                <p className="text-xs text-slate-400">Planning phase initiated</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">Volunteer Registration</p>
                <p className="text-xs text-slate-400">{stats?.volunteers ?? 0} registered so far</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-slate-300 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">Event Day</p>
                <p className="text-xs text-slate-400">
                  {event?.date
                    ? new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Date TBA'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
