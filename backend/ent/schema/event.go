package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type Event struct {
	ent.Schema
}

// Fields of the User.
func (Event) Fields() []ent.Field {
	return []ent.Field{
		field.Int("eventId").Unique(),
		field.String("eventName"),
		field.Int("quota"),
		field.Int("counter"),
		field.String("description"),
		field.String("image"),
		field.Float("lat"),
		field.Float("long"),
		field.Float("radius"),
		field.Int("status"),
		field.Float("startDate"),
		field.Float("endDate"),
		field.Int("totalRareNFT"),
	}
}

// Edges of the User.
func (Event) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("participants", EventParticipant.Type),
		edge.From("partner", Partner.Type).
			Ref("partner_address").
			Unique().
			Required(),
		edge.To("nfts", Nft.Type),
	}
}
