// AccountManagement.tsx
// Updated to center the grid, add Save Changes and Exit Without Saving buttons in the header, and disable Save Changes until edits are made.

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AccountManagement.css';

declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_BASE_URL?: string;
    };
  }
}

interface SubscriptionInfo {
  inviteCode: string;
  subscriptionType: string;
  subscriptionCost: string;
  autoRenew: boolean;
  expDate: string;
  nextBilling: string;
}

interface EmailEntry {
  email: string;
  primary: boolean;
}

interface PersonInputs {
    firstName: string;
    lastName: string;
    prefix: string;
    suffex: string;
    moniker: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
interface BillingInfo {
  cardNumber: string;
  expiry: string;
  cvv: string;
}
interface FormData {
  userName: string;
  phones: string[];
  emails: EmailEntry[];
  address: Address;
  billing: BillingInfo;
  subscription: SubscriptionInfo;
  person: PersonInputs;
}
interface Errors {
  userName?: string;
}

export default function AccountManagement(): React.JSX.Element {
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.fromDashboard === true;

  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    phones: ['', ''],
    emails: [ 
        { email: '', primary: true },
        { email: '', primary: false},
        { email: '', primary: false},
    ],
    address: { street: '', city: '', state: '', postalCode: '', country: '' },
    billing: { cardNumber: '', expiry: '', cvv: '' },
    subscription: { inviteCode: '',subscriptionType: '', subscriptionCost: '', autoRenew: false, expDate: '', nextBilling: '' },
    person: { firstName: '', lastName: '', prefix: '', suffex: '', moniker: ''},
  });
  const [initialData, setInitialData] = useState<FormData | null>(null);
  const [errors, setErrors] = useState<Errors>({});

// Always render exactly 3 email inputs, filling missing slots with blanks
  const renderEmailInputs = () => {
    const emailsToRender: EmailEntry[] = [...formData.emails];
    while (emailsToRender.length < 3) {
      emailsToRender.push({ email: '', primary: false });
    }

    return emailsToRender.map((em, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          className="email-input"
          type="email"
          placeholder="Email address"
          value={em.email}
          onChange={e => {
            const updatedEmails = [...emailsToRender];
            updatedEmails[i].email = e.target.value;
            setFormData(prev => ({ ...prev, emails: updatedEmails }));
          }}
        />
        <label>
          <input
            type="radio"
            name="primaryEmail"
            checked={em.primary}
            onChange={() => {
              const updatedEmails = emailsToRender.map((email, idx) => ({
                ...email,
                primary: idx === i
              }));
              setFormData(prev => ({ ...prev, emails: updatedEmails }));
            }}
          /> Primary
        </label>
        {i > 0 && (
          <button type="button" onClick={() => {
            const updatedEmails = emailsToRender.map((email, idx) =>
              idx === i ? { ...email, email: '', primary: false } : email
            );
            setFormData(prev => ({ ...prev, emails: updatedEmails }));
          }}>
            Remove
          </button>
        )}
      </div>
    ));
  };


// Always render exactly 2 phone inputs, filling missing slots with blanks
  const renderPhoneInputs = () => {
    const phonesToRender: string[] = [...formData.phones];
    while (phonesToRender.length < 2) {
      phonesToRender.push('');
    }

    return phonesToRender.map((phone, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <input
          className="phone-input"
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={e => {
            const updatedPhones = [...phonesToRender];
            updatedPhones[i] = e.target.value;
            setFormData(prev => ({ ...prev, phones: updatedPhones }));
          }}
        />
        {i > 0 && (
          <button type="button" onClick={() => {
            const updatedPhones = [...phonesToRender];
            updatedPhones[i] = '';
            setFormData(prev => ({ ...prev, phones: updatedPhones }));
          }}>
            Remove
          </button>
        )}
      </div>
    ));
  };

// Render personal information inputs similar to phone inputs

const renderPersonInputs = () => {
  const personToRender: PersonInputs = formData.person || {
    firstName: '',
    lastName: '',
    prefix: '',
    suffex: '',
    moniker: ''
  };

  return (
    <section className="person-section">
    <h2 className="person-section-title">Personal Information</h2>
    {Object.entries(formData.person).map(([key, val]) => (
    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <label className="person-fields">
        {key.charAt(0).toUpperCase() + key.slice(1)}:
      </label>
      <div className="person-fields">
      <input
        className="person-fields"
        type="text"
        value={val}
        onChange={e =>
          setFormData(prev => ({
            ...prev,
            person: { ...prev.person, [key]: e.target.value }
          }))
        }
      />
      </div>
    </div>
  ))}
</section>)
};

  useEffect(() => {
    async function initializeForm() {
      if (!accounts || accounts.length === 0) {
        navigate('/', { replace: true });
        return;
      }
      const account = accounts[0];
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';

      let fetchedData: FormData = {
        userName: '',
        phones: [''],
        emails: [{ email: account.username, primary: true }],
        address: { street: '', city: '', state: '', postalCode: '', country: '' },
        billing: { cardNumber: '', expiry: '', cvv: '' },
        subscription: { inviteCode: '', subscriptionType: '', subscriptionCost: '', autoRenew: false, expDate: '', nextBilling: '' },
        person: { firstName: '', lastName: '', prefix: '', suffex: '', moniker: ''},
      };

      if (isEditMode) {
        try {
          const res = await fetch(`${apiBase}/api/users/${account.idTokenClaims?.oid}`);
          if (res.ok) {
            const userRecord = await res.json();
            fetchedData = {
              userName: userRecord.userName || '',
              phones: userRecord.phones?.length ? userRecord.phones : [''],
              emails: userRecord.emails || [{ email: account.username, primary: true }],
              address: userRecord.address || { street: '', city: '', state: '', postalCode: '', country: '' },
              billing: userRecord.billing || { cardNumber: '', expiry: '', cvv: '' },
              subscription: userRecord.subscription || { inviteCode: '', subscriptionType: '', subscriptionCost: '', autoRenew: false, expDate: '', nextBilling: '' },
              person: userRecord.person || { firstName: '', lastName: '', prefix: '', suffex: '', moniker: ''},
            };
          }
        } catch (err) {
          console.error('Error fetching user record:', err);
        }
      }

      setFormData(fetchedData);
      setInitialData(fetchedData);
      setLoading(false);
    }
    initializeForm();
  }, [accounts, navigate, isEditMode]);

  const validate = (): boolean => {
    const newErrors: Errors = {};
    if (formData.userName.trim().length < 3) {
      newErrors.userName = 'User name must be at least 3 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (key: 'phones' | 'emails', index: number, value: string) => {
    const updated = [...formData[key]];
    if (key === 'phones') {
      updated[index] = value;
      setFormData(prev => ({ ...prev, phones: updated as string[] }));
    } else {
      (updated as EmailEntry[])[index].email = value;
      setFormData(prev => ({ ...prev, emails: updated as EmailEntry[] }));
    }
  };

  const addArrayItem = (key: 'phones' | 'emails') => {
    if (key === 'phones') {
      setFormData(prev => ({ ...prev, phones: [...prev.phones, ''] }));
    } else {
      setFormData(prev => ({ ...prev, emails: [...prev.emails, { email: '', primary: false }] }));
    }
  };

  const removeArrayItem = (key: 'phones' | 'emails', index: number) => {
    setFormData(prev => ({ ...prev, [key]: formData[key].filter((_, i) => i !== index) }));
  };

  const setPrimaryEmail = (index: number) => {
    const updatedEmails = formData.emails.map((email, i) => ({ ...email, primary: i === index }));
    setFormData(prev => ({ ...prev, emails: updatedEmails }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!formData.emails.some(e => e.primary)) {
    setErrors(prev => ({ ...prev, email: "At least one primary email is required" }));
    return;
}
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || '';
      const account = accounts[0];
      const externalId = account.idTokenClaims?.oid ?? '';
/* When adding new fields to the payload (and the form) you must also update the server.js
 * file so that the new fields are sent to the database. Otherwise, they appear on the screen,
 * and users can type in them, but the values they type are never stored. 
*/
      const payload = {
        externalId,
        email: account.username,
        userName: formData.userName,
        phones: formData.phones.filter(p => p.trim()),
        emails: formData.emails,
        address: formData.address,
        billing: formData.billing,
        subscription: formData.subscription,
        person: formData.person
      };

  console.log("Payload being sent to API:", payload); // ✅ Added log to inspect data sent to backend
     
      const res = await fetch(`${apiBase}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`API error: ${res.statusText}`);

       // ✅ Update initialData after successful save
      setInitialData(formData);

      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Account creation failed:', err);
      setLoading(false);
    }
  };

  const handleExit = () => navigate('/dashboard', { replace: true });

  if (loading) return <div>Loading account setup...</div>;

  const account = accounts[0];
  const objectId = account?.idTokenClaims?.oid ?? 'Unavailable';

  return (
    <div className="account-container full-page">
      <div className="account-header">
        <h1 className="account-title">Account Settings</h1>
        <div className="header-buttons">
          <button type="submit" className="save-button" form="account-form" disabled={JSON.stringify(formData) === JSON.stringify(initialData)}>Save Changes</button>
          <button type="button" className="exit-button" onClick={() => navigate('/dashboard', { replace: true })}>Exit Without Saving</button>
        </div>
      </div>

     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw' }}>
      <form id="account-form" onSubmit={handleSubmit} className="account-form-grid full-grid">
        

        <section className="user-section">
            <h2 >User Information</h2>
          <label>
           
            <div className="user-name">
             <label className="user-name">User Name: </label>
            <input
              className="user-name-input"
              type="text"
              value={formData.userName}
              onChange={e => handleChange('userName', e.target.value)}
            />
            
            </div>
            </label>

          
          {errors.userName && <div className="error-text">{errors.userName}</div>}

          <div className="subscription-fields">
              <label>
                Invitation Code: 
                <input
                  type="text"
                  value={formData.subscription.inviteCode}
                  onChange={e => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, subscriptionType: e.target.value } }))}
                />
               <p></p>
              </label>

              <label>
                Subscription Type:
               
                <input
                  type="text"
                  value={formData.subscription.subscriptionType}
                  onChange={e => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, subscriptionType: e.target.value } }))}
                />
                 <p></p>
              </label>

              <label>
                Subscription Cost:
                <input
                  type="text"
                  value={formData.subscription.subscriptionCost}
                  onChange={e => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, subscriptionCost: e.target.value } }))}
                />
                <p></p>
              </label>

              <label>
                Auto Renew:
                <input
                  type="checkbox"
                  checked={formData.subscription.autoRenew}
                  onChange={e => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, autoRenew: e.target.checked } }))}
                />
                <p></p>
              </label>

              <label>
                Exp Date:
                <input
                  type="date"
                  value={formData.subscription.expDate}
                  onChange={e => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, expDate: e.target.value } }))}
                />
                <p></p>
              </label>

              <label>
                Next Billing:
                <input
                  type="date"
                  value={formData.subscription.nextBilling}
                  onChange={e => setFormData(prev => ({ ...prev, subscription: { ...prev.subscription, nextBilling: e.target.value } }))}
                />
                <p></p>
              </label>
            </div>
          </section>    

        

        <section className="emails-section">
          <h2 className="email-address-title">Email Addresses</h2>
           {renderEmailInputs()}
          <h2 className="phone-number">Phone Numbers</h2>
           {renderPhoneInputs()}
        </section>



      
         {renderPersonInputs()}
     
      

        <section className="address-section">
          <h2 className="address-address">Physical Address</h2>
          {Object.entries(formData.address).map(([key, val]) => (
            <div key={key}>
                <div className="address-fields">
              <label>
                {key.charAt(0).toUpperCase() + key.slice(1)}:
                <input
                  className="address-input"
                  type="text"
                  value={val}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, [key]: e.target.value }
                    }))
                  }
                />
              </label>
              </div>
            </div>
          ))}
        </section>

        <section className="billing-section">
          <h2 className="billing-info">Billing Information</h2>
          {(['cardNumber', 'expiry', 'cvv'] as (keyof BillingInfo)[]).map(field => (
            <div key={field}>
                 <div className="billing-fields">
              <label>
                {field.replace(/([A-Z])/g, ' $1').trim()}:
                <input
                  className="billing-input"
                  type="text"
                  value={formData.billing[field]}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      billing: { ...prev.billing, [field]: e.target.value }
                    }))
                  }
                />
              </label>
                </div>
            </div>
          ))}
        </section>

        <section className="profile-section">   
          <h2 className="profile-heading">Your Microsoft Entra ID Profile</h2>
          <h4 className="profile-heading2">NON-EDITABLE FIELDS INHERITED FROM MICROSOFT MANAGED ID</h4>
          <p><strong></strong></p>
          <p><strong>Name:</strong> {account?.name ?? 'N/A'}</p>
          <p><strong>Email:</strong> {account?.username ?? 'N/A'}</p>
          <p><strong>Object ID:</strong> {objectId}</p>
        </section>
        
      </form>
      </div>
    </div>
  );
}