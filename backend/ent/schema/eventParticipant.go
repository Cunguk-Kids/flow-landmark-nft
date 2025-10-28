package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type EventParticipant struct {
	ent.Schema
}

// Fields of the User.
func (EventParticipant) Fields() []ent.Field {
	return []ent.Field{
		field.String("userAddress").Default(""),
		field.Bool("isCheckedIn").Default(false),
	}
}

// Edges of the User.
func (EventParticipant) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("event", Event.Type).Ref("event_id").Unique().Required(),
	}
}
