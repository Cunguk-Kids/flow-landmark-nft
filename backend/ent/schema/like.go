package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

// Like holds the schema definition for the Like entity.
type Like struct {
	ent.Schema
}

// Fields of the Like.
func (Like) Fields() []ent.Field {
	return []ent.Field{
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
	}
}

// Edges of the Like.
func (Like) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("likes").
			Unique().
			Required(),
		edge.From("moment", NFTMoment.Type).
			Ref("likes").
			Unique().
			Required(),
	}
}

// Indexes of the Like.
func (Like) Indexes() []ent.Index {
	return []ent.Index{
		// Ensure a user can only like a moment once
		index.Edges("user", "moment").Unique(),
	}
}
