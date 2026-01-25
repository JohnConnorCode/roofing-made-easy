// SEO Components - Barrel Export

// Basic schemas
export {
  LocalBusinessSchema,
  ServiceSchema,
  FAQSchema,
  WebPageSchema,
} from './json-ld'

// Location-specific schemas
export {
  CityLocationSchema,
  CountyLocationSchema,
  ServiceLocationSchema,
  FAQLocationSchema,
  BreadcrumbSchema,
} from './location-schema'

// Advanced schemas
export {
  OrganizationSchema,
  WebSiteSchema,
  EnhancedLocalBusinessSchema,
  DetailedServiceSchema,
  HowToSchema,
  ReviewSchema,
  GeoMetaTags,
  ArticleSchema,
  SitelinksSearchBoxSchema,
  generateComprehensiveMeta,
} from './advanced-schema'

// Regional SEO schemas
export {
  ServiceAreaSchema,
  ProfessionalCredentialsSchema,
  MultiLocationSchema,
  AggregateReviewSchema,
  SeasonalPromotionSchema,
  SpeakableSchema,
  VideoSchema,
  ImageGallerySchema,
  ServiceAreaGeoSchema,
  BrandSameAsSchema,
} from './regional-schema'

// NAP consistency
export {
  NAPSchema,
  MinimalNAPSchema,
  ContactPageNAPSchema,
  BUSINESS_INFO,
  getBusinessInfo,
  formatPhone,
  formatAddress,
} from './nap-schema'

// Internal linking components
export {
  RelatedCitiesLinks,
  ServiceCrossLinks,
  AllServicesInCity,
  CountyCitiesGrid,
  RegionalNavigation,
  SiloNavigation,
  FooterLocationLinks,
} from './internal-links'
