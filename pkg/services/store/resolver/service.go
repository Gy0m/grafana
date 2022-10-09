package resolver

import (
	"context"
	"fmt"
	"time"

	"github.com/grafana/grafana/pkg/models"
	"github.com/grafana/grafana/pkg/plugins/manager/registry"
	"github.com/grafana/grafana/pkg/services/sqlstore/db"
	"github.com/grafana/grafana/pkg/setting"
)

// for testing
var getNow = func() time.Time { return time.Now() }

type ResolutionInfo struct {
	OK        bool      `json:"ok"`
	Key       string    `json:"key,omitempty"`  // GRN? UID?
	Warning   string    `json:"kind,omitempty"` // old syntax?  (name>uid) references a renamed object?
	Timestamp time.Time `json:"timestamp,omitempty"`
}

type ObjectReferenceResolver interface {
	Resolve(ctx context.Context, ref *models.ObjectExternalReference) ResolutionInfo
}

func ProvideObjectReferenceResolver(cfg *setting.Cfg, db db.DB, pluginRegistry registry.Service) ObjectReferenceResolver {
	return &standardReferenceResolver{
		pluginRegistry: pluginRegistry,
		ds: dsCache{
			db:             db,
			pluginRegistry: pluginRegistry,
		},
	}
}

type standardReferenceResolver struct {
	pluginRegistry registry.Service
	ds             dsCache
}

func (r *standardReferenceResolver) Resolve(ctx context.Context, ref *models.ObjectExternalReference) ResolutionInfo {
	if ref == nil {
		return ResolutionInfo{
			OK:        false,
			Timestamp: getNow(),
			Warning:   "invalid reference (nil)",
		}
	}

	switch ref.Kind {
	case models.StandardKindDataSource:
		return r.resolveDatasource(ctx, ref)

	case models.StandardKindPanel:
		return r.resolvePanel(ctx, ref)
	}

	return ResolutionInfo{
		OK:        false,
		Timestamp: getNow(),
		Warning:   "unable to resolve kind",
	}
}

func (r *standardReferenceResolver) resolveDatasource(ctx context.Context, ref *models.ObjectExternalReference) ResolutionInfo {
	ds := r.ds.getDS(ctx, ref.UID)
	res := ResolutionInfo{
		OK:        true,
		Timestamp: r.ds.timestamp,
		Key:       ds.UID, // TODO!
	}
	if ds.UID == "" {
		res.OK = false
		res.Warning = "not found"
	} else if !ds.PluginExists {
		res.OK = false
		res.Warning = "datasource plugin not found"
	} else if ref.Type == "" {
		res.Warning = "not type specified"
	} else if ref.Type != ds.Type {
		res.Warning = fmt.Sprintf("type mismatch (expect:%s, found:%s)", ref.Type, ds.Type)
	}
	return res
}

func (r *standardReferenceResolver) resolvePanel(ctx context.Context, ref *models.ObjectExternalReference) ResolutionInfo {
	p, ok := r.pluginRegistry.Plugin(ctx, ref.Type)
	if !ok || p == nil {
		return ResolutionInfo{
			OK:        false,
			Timestamp: getNow(),
			Warning:   "Plugin not found",
		}
	}

	if p.Type != "panel" {
		return ResolutionInfo{
			OK:        false,
			Timestamp: getNow(),
			Warning:   "Plugin is not of type panel",
		}
	}

	return ResolutionInfo{
		OK:        true,
		Timestamp: getNow(),
	}
}
