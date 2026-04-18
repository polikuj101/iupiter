export const dynamic = 'force-dynamic';

const CRM_LIST = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync contacts and create deals automatically',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-500',
    available: true,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Push leads and log activities to Salesforce CRM',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-500',
    available: false,
    badge: 'Coming soon',
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    description: 'Automatically sync leads to Zoho modules',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-500',
    available: false,
    badge: 'Coming soon',
  },
  {
    id: 'gohighlevel',
    name: 'GoHighLevel',
    description: 'Sync contacts and opportunities with GHL',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-500',
    available: false,
    badge: 'Coming soon',
  },
];

export default function IntegrationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CRM Integrations</h1>
        <p className="text-slate-500 text-sm mt-1">
          Automatically sync contacts and leads to your CRM when conversations happen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CRM_LIST.map((crm) => (
          <div
            key={crm.id}
            className={`bg-white rounded-xl border-2 p-6 ${crm.available ? crm.color : 'border-slate-100 opacity-60'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${crm.available ? crm.color : 'bg-slate-100'} flex items-center justify-center`}>
                <span className={`font-bold text-lg ${crm.iconColor}`}>
                  {crm.name[0]}
                </span>
              </div>
              {crm.badge && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-medium">
                  {crm.badge}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{crm.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{crm.description}</p>
            <button
              disabled={!crm.available}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                crm.available
                  ? 'bg-slate-900 text-white hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {crm.available ? 'Connect' : 'Not available yet'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <p className="text-sm text-blue-800">
          <strong>How sync works:</strong> When a new person messages your agent, they are automatically
          created as a contact. When you update their lead status (new → qualified → converted),
          the change is pushed to your connected CRM instantly.
        </p>
      </div>
    </div>
  );
}
