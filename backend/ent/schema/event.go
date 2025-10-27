package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type Event struct {
	ent.Schema
}

// Fields of the User.
func (Event) Fields() []ent.Field {
	return []ent.Field{
		field.String("eventId").
			Default("0"),
		field.String("brandAddress").
			Default("Unknown"),
	}
}

// Edges of the User.
func (Event) Edges() []ent.Edge {
	return nil
}
