import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Customer,
  CustomerLead,
  FinancingApplication,
  InsuranceClaim,
  CustomerProgramApplication,
  AssistanceProgram,
  Lead,
  Estimate,
  Property,
  Intake,
  Upload,
} from '@/lib/supabase/types'

// Extended lead with related data
export interface CustomerLeadWithDetails extends CustomerLead {
  lead?: Lead & {
    property?: Property
    intake?: Intake
    estimate?: Estimate
    uploads?: Upload[]
  }
}

export interface CustomerState {
  // Customer profile
  customer: Customer | null
  isLoading: boolean
  error: string | null

  // Linked leads/properties
  linkedLeads: CustomerLeadWithDetails[]
  selectedLeadId: string | null

  // Financing
  financingApplications: FinancingApplication[]

  // Insurance
  insuranceClaims: InsuranceClaim[]

  // Assistance programs
  eligiblePrograms: AssistanceProgram[]
  programApplications: CustomerProgramApplication[]
}

export interface CustomerActions {
  // Customer profile
  setCustomer: (customer: Customer | null) => void
  updateCustomer: (updates: Partial<Customer>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Linked leads
  setLinkedLeads: (leads: CustomerLeadWithDetails[]) => void
  addLinkedLead: (lead: CustomerLeadWithDetails) => void
  updateLinkedLead: (leadId: string, updates: Partial<CustomerLead>) => void
  removeLinkedLead: (linkId: string) => void
  setSelectedLeadId: (leadId: string | null) => void

  // Financing
  setFinancingApplications: (applications: FinancingApplication[]) => void
  addFinancingApplication: (application: FinancingApplication) => void
  updateFinancingApplication: (id: string, updates: Partial<FinancingApplication>) => void

  // Insurance
  setInsuranceClaims: (claims: InsuranceClaim[]) => void
  addInsuranceClaim: (claim: InsuranceClaim) => void
  updateInsuranceClaim: (id: string, updates: Partial<InsuranceClaim>) => void

  // Assistance programs
  setEligiblePrograms: (programs: AssistanceProgram[]) => void
  setProgramApplications: (applications: CustomerProgramApplication[]) => void
  addProgramApplication: (application: CustomerProgramApplication) => void
  updateProgramApplication: (id: string, updates: Partial<CustomerProgramApplication>) => void

  // Reset
  resetCustomerStore: () => void
}

const initialState: CustomerState = {
  customer: null,
  isLoading: false,
  error: null,
  linkedLeads: [],
  selectedLeadId: null,
  financingApplications: [],
  insuranceClaims: [],
  eligiblePrograms: [],
  programApplications: [],
}

export const useCustomerStore = create<CustomerState & CustomerActions>()(
  persist(
    (set) => ({
      ...initialState,

      // Customer profile
      setCustomer: (customer) => set({ customer }),
      updateCustomer: (updates) => set((state) => ({
        customer: state.customer ? { ...state.customer, ...updates } : null,
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Linked leads
      setLinkedLeads: (linkedLeads) => set({ linkedLeads }),
      addLinkedLead: (lead) => set((state) => ({
        linkedLeads: [...state.linkedLeads, lead],
      })),
      updateLinkedLead: (leadId, updates) => set((state) => ({
        linkedLeads: state.linkedLeads.map((l) =>
          l.lead_id === leadId ? { ...l, ...updates } : l
        ),
      })),
      removeLinkedLead: (linkId) => set((state) => ({
        linkedLeads: state.linkedLeads.filter((l) => l.id !== linkId),
      })),
      setSelectedLeadId: (selectedLeadId) => set({ selectedLeadId }),

      // Financing
      setFinancingApplications: (financingApplications) => set({ financingApplications }),
      addFinancingApplication: (application) => set((state) => ({
        financingApplications: [...state.financingApplications, application],
      })),
      updateFinancingApplication: (id, updates) => set((state) => ({
        financingApplications: state.financingApplications.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      })),

      // Insurance
      setInsuranceClaims: (insuranceClaims) => set({ insuranceClaims }),
      addInsuranceClaim: (claim) => set((state) => ({
        insuranceClaims: [...state.insuranceClaims, claim],
      })),
      updateInsuranceClaim: (id, updates) => set((state) => ({
        insuranceClaims: state.insuranceClaims.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      })),

      // Assistance programs
      setEligiblePrograms: (eligiblePrograms) => set({ eligiblePrograms }),
      setProgramApplications: (programApplications) => set({ programApplications }),
      addProgramApplication: (application) => set((state) => ({
        programApplications: [...state.programApplications, application],
      })),
      updateProgramApplication: (id, updates) => set((state) => ({
        programApplications: state.programApplications.map((a) =>
          a.id === id ? { ...a, ...updates } : a
        ),
      })),

      // Reset
      resetCustomerStore: () => set(initialState),
    }),
    {
      name: 'customer-storage',
      partialize: (state) => ({
        customer: state.customer,
        selectedLeadId: state.selectedLeadId,
        // Don't persist detailed data - fetch fresh on login
      }),
    }
  )
)

// Selector hooks for better performance
export const useCustomer = () => useCustomerStore((state) => state.customer)
export const useCustomerLoading = () => useCustomerStore((state) => state.isLoading)
export const useCustomerError = () => useCustomerStore((state) => state.error)
export const useLinkedLeads = () => useCustomerStore((state) => state.linkedLeads)
export const useSelectedLeadId = () => useCustomerStore((state) => state.selectedLeadId)
export const useFinancingApplications = () => useCustomerStore((state) => state.financingApplications)
export const useInsuranceClaims = () => useCustomerStore((state) => state.insuranceClaims)
export const useEligiblePrograms = () => useCustomerStore((state) => state.eligiblePrograms)
export const useProgramApplications = () => useCustomerStore((state) => state.programApplications)

// Derived selectors
export const useSelectedLead = () => useCustomerStore((state) =>
  state.linkedLeads.find((l) => l.lead_id === state.selectedLeadId)
)

export const usePrimaryLead = () => useCustomerStore((state) =>
  state.linkedLeads.find((l) => l.is_primary)
)

export const useFinancingForLead = (leadId: string) => useCustomerStore((state) =>
  state.financingApplications.filter((a) => a.lead_id === leadId)
)

export const useInsuranceClaimForLead = (leadId: string) => useCustomerStore((state) =>
  state.insuranceClaims.find((c) => c.lead_id === leadId)
)

export const useProgramApplicationsForLead = (leadId: string) => useCustomerStore((state) =>
  state.programApplications.filter((a) => a.lead_id === leadId)
)
