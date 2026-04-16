import { defineArrayMember, defineField, defineType } from 'sanity';

const categories = [
  { title: 'Health & Biology', value: 'health-biology' },
  { title: 'Nature & Outdoors', value: 'nature-outdoors' },
  { title: 'Mathematics', value: 'mathematics' },
  { title: 'Cooking', value: 'cooking' },
  { title: 'Engineering & Technology', value: 'engineering-technology' },
  { title: 'Trades, Materials & Craft', value: 'trades-materials-craft' },
  { title: 'History, Society & Belief', value: 'history-society-belief' },
  { title: 'Strategy & Competition', value: 'strategy-games' },
] as const;

const statusOptions = [
  { title: 'Draft', value: 'draft' },
  { title: 'Published', value: 'published' },
] as const;

const visibilityOptions = [
  { title: 'Public', value: 'public' },
  { title: 'Unlisted', value: 'unlisted' },
] as const;

export const curriculum = defineType({
  name: 'curriculum',
  title: 'Curriculum',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 200,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: statusOptions,
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'visibility',
      title: 'Visibility',
      type: 'string',
      options: {
        list: visibilityOptions,
        layout: 'radio',
      },
      initialValue: 'public',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'category',
      title: 'Homepage Category',
      type: 'string',
      options: {
        list: categories,
      },
    }),
    defineField({
      name: 'homepageOrder',
      title: 'Homepage Order',
      type: 'number',
      validation: (Rule) => Rule.integer().positive(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
    }),
    defineField({
      name: 'parent',
      title: 'Parent Curriculum',
      type: 'reference',
      to: [{ type: 'curriculum' }],
      options: {
        disableNew: true,
      },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parentRef = value?._ref;
          if (!parentRef) {
            return true;
          }

          const documentId = context.document?._id?.replace(/^drafts\./, '');
          if (documentId && parentRef.replace(/^drafts\./, '') === documentId) {
            return 'A document cannot be its own parent.';
          }

          return true;
        }),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (Rule) => Rule.required().uri({
                      allowRelative: true,
                      scheme: ['http', 'https', 'mailto', 'tel'],
                    }),
                  }),
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          name: 'alert',
          title: 'Alert',
          type: 'object',
          fields: [
            defineField({
              name: 'tone',
              title: 'Tone',
              type: 'string',
              options: {
                list: [
                  { title: 'Info', value: 'info' },
                  { title: 'Warning', value: 'warning' },
                  { title: 'Success', value: 'success' },
                ],
              },
              initialValue: 'info',
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'block',
                  styles: [{ title: 'Normal', value: 'normal' }],
                  lists: [
                    { title: 'Bullet', value: 'bullet' },
                    { title: 'Numbered', value: 'number' },
                  ],
                  marks: {
                    decorators: [
                      { title: 'Strong', value: 'strong' },
                      { title: 'Emphasis', value: 'em' },
                      { title: 'Code', value: 'code' },
                    ],
                    annotations: [
                      {
                        name: 'link',
                        title: 'Link',
                        type: 'object',
                        fields: [
                          defineField({
                            name: 'href',
                            title: 'URL',
                            type: 'url',
                            validation: (Rule) => Rule.required().uri({
                              allowRelative: true,
                              scheme: ['http', 'https', 'mailto', 'tel'],
                            }),
                          }),
                        ],
                      },
                    ],
                  },
                }),
              ],
            }),
          ],
        }),
        defineArrayMember({
          name: 'youtubeEmbed',
          title: 'YouTube Embed',
          type: 'object',
          fields: [
            defineField({
              name: 'id',
              title: 'Video ID',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
            }),
          ],
        }),
        defineArrayMember({
          name: 'mapEmbed',
          title: 'Map Embed',
          type: 'object',
          fields: [
            defineField({
              name: 'mapType',
              title: 'Map Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Highlights', value: 'highlights' },
                  { title: 'Relief', value: 'relief' },
                  { title: 'Strategic', value: 'strategic' },
                ],
              },
              initialValue: 'highlights',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
        defineArrayMember({
          name: 'worldMapHighlights',
          title: 'World Map Highlights',
          type: 'object',
          fields: [],
        }),
        defineArrayMember({
          name: 'worldReliefMap',
          title: 'World Relief Map',
          type: 'object',
          fields: [],
        }),
        defineArrayMember({
          name: 'worldStrategicMap',
          title: 'World Strategic Map',
          type: 'object',
          fields: [],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  orderings: [
    {
      title: 'Updated (newest first)',
      name: 'updatedAtDesc',
      by: [{ field: 'updatedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'slug.current',
      status: 'status',
      visibility: 'visibility',
    },
    prepare(selection) {
      const { title, subtitle, status, visibility } = selection;
      const state = [status, visibility].filter(Boolean).join(' · ');

      return {
        title,
        subtitle: [subtitle, state].filter(Boolean).join(' — '),
      };
    },
  },
});
