import { ProviderApplication } from '../types';
import { backendStore, ProviderRecord } from '../store/backendStore';

export class ProviderRepository {
  public findAll(filters: { category?: string; locality?: string; onlineOnly?: boolean } = {}): ProviderRecord[] {
    let list = Array.from(backendStore.providers.values());

    if (filters.category) {
      list = list.filter((p) => p.categories.includes(filters.category as any));
    }
    if (filters.locality) {
      list = list.filter((p) =>
        p.serviceAreas.some((sa) => sa.toLowerCase().includes(filters.locality!.toLowerCase()))
      );
    }
    if (filters.onlineOnly) {
      list = list.filter((p) => p.isOnline && p.verificationStatus === 'Approved');
    }

    return list;
  }

  public findById(id: string): ProviderRecord | undefined {
    return backendStore.providers.get(id);
  }

  public save(provider: ProviderRecord): ProviderRecord {
    backendStore.providers.set(provider.id, provider);
    return provider;
  }

  public saveApplication(application: ProviderApplication): ProviderApplication {
    backendStore.providerApplications.set(application.id, application);
    return application;
  }

  public findApplicationById(id: string): ProviderApplication | undefined {
    return backendStore.providerApplications.get(id);
  }

  public findAllApplications(): ProviderApplication[] {
    const apps = Array.from(backendStore.providerApplications.values());
    apps.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    return apps;
  }
}

export const providerRepository = new ProviderRepository();
