export interface LicenseGroup {
  title: string;
  items: {
    name: string;
    version: string;
    license: string;
    notices: { title: string; text: string }[];
  }[];
}
