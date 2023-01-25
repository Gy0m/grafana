// Code generated - EDITING IS FUTILE. DO NOT EDIT.
//
// Generated by:
//     kinds/gen.go
// Using jennies:
//     TSVeneerIndexJenny
//
// Run 'make gen-cue' from repository root to regenerate.

// Raw generated types from Apikey kind.
export type {
  Apikey,
  OrgRole
} from './raw/apikey/x/apikey_types.gen';

// Raw generated types from Dashboard kind.
export type {
  AnnotationTarget,
  AnnotationQuery,
  DashboardLink,
  DashboardLinkType,
  VariableType,
  FieldColorSeriesByMode,
  FieldColor,
  GridPos,
  Threshold,
  ThresholdsConfig,
  ValueMapping,
  ValueMap,
  RangeMap,
  RegexMap,
  SpecialValueMap,
  ValueMappingResult,
  Transformation,
  RowPanel,
  GraphPanel,
  HeatmapPanel
} from './raw/dashboard/x/dashboard_types.gen';

// Raw generated enums and default consts from dashboard kind.
export {
  defaultAnnotationTarget,
  defaultAnnotationQuery,
  LoadingState,
  defaultDashboardLink,
  FieldColorModeId,
  defaultGridPos,
  ThresholdsMode,
  defaultThresholdsConfig,
  MappingType,
  SpecialValueMatch,
  DashboardCursorSync,
  defaultDashboardCursorSync,
  defaultRowPanel
} from './raw/dashboard/x/dashboard_types.gen';

// The following exported declarations correspond to types in the dashboard@0.0 kind's
// schema with attribute @grafana(TSVeneer="type").
//
// The handwritten file for these type and default veneers is expected to be at
// packages/grafana-schema/src/veneer/dashboard.types.ts.
// This re-export declaration enforces that the handwritten veneer file exists,
// and exports all the symbols in the list.
//
// TODO generate code such that tsc enforces type compatibility between raw and veneer decls
export type {
  Dashboard,
  VariableModel,
  DataSourceRef,
  Panel,
  FieldConfigSource,
  MatcherConfig,
  FieldConfig
} from './veneer/dashboard.types';

// The following exported declarations correspond to types in the dashboard@0.0 kind's
// schema with attribute @grafana(TSVeneer="type").
//
// The handwritten file for these type and default veneers is expected to be at
// packages/grafana-schema/src/veneer/dashboard.types.ts.
// This re-export declaration enforces that the handwritten veneer file exists,
// and exports all the symbols in the list.
//
// TODO generate code such that tsc enforces type compatibility between raw and veneer decls
export {
  defaultDashboard,
  defaultVariableModel,
  VariableHide,
  defaultPanel,
  defaultFieldConfigSource,
  defaultMatcherConfig,
  defaultFieldConfig
} from './veneer/dashboard.types';

// Raw generated types from Playlist kind.
export type {
  Playlist,
  PlaylistItem
} from './raw/playlist/x/playlist_types.gen';

// Raw generated enums and default consts from playlist kind.
export { defaultPlaylist } from './raw/playlist/x/playlist_types.gen';

// Raw generated types from Serviceaccount kind.
export type {
  Serviceaccount,
  OrgRole
} from './raw/serviceaccount/x/serviceaccount_types.gen';

// Raw generated enums and default consts from serviceaccount kind.
export { defaultServiceaccount } from './raw/serviceaccount/x/serviceaccount_types.gen';

// Raw generated types from Team kind.
export type { Team } from './raw/team/x/team_types.gen';

// Raw generated enums and default consts from team kind.
export { Permission } from './raw/team/x/team_types.gen';
