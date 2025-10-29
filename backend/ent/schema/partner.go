package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type Partner struct {
	ent.Schema
}

// Fields of the User.
func (Partner) Fields() []ent.Field {
	return []ent.Field{
		field.String("address").Unique(),
		field.String("name").Default(""),
		field.String("description").Default(""),
		field.String("email").Default(""),
		field.String("image").Default(""),
	}
}

// Edges of the User.
func (Partner) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("partner_address", Event.Type),
	}
}
