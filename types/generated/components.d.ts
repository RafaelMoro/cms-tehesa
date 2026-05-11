import type { Schema, Struct } from '@strapi/strapi';

export interface SharedCategory extends Struct.ComponentSchema {
  collectionName: 'components_shared_categories';
  info: {
    displayName: 'category';
    icon: 'apps';
  };
  attributes: {
    categoryType: Schema.Attribute.Enumeration<
      [
        'tornilleria',
        'llaves_herramientas_apriete',
        'perforacion_accesorios_taladro',
        'roscado_herramientas_roscas',
        'extraccion_reparaci\u00F3n_fijaciones',
        'herramientas_corte_conformado',
      ]
    >;
  };
}

export interface SharedDetails extends Struct.ComponentSchema {
  collectionName: 'components_shared_details';
  info: {
    displayName: 'details';
    icon: 'bulletList';
  };
  attributes: {
    diameter: Schema.Attribute.String;
    internalId: Schema.Attribute.String & Schema.Attribute.Unique;
    length: Schema.Attribute.String;
    material: Schema.Attribute.String;
    packageQuantity: Schema.Attribute.Integer;
    screwHeadType: Schema.Attribute.Enumeration<
      [
        'hexagonal',
        'cilindrica',
        'baja_cilindrica',
        'baja',
        'baja_metrico',
        'plana_std',
        'plana',
        'boton_std',
        'boton',
        'queso_ranurado',
        'plana_phillips',
        'coche',
        'plana_ranurado',
        'queso',
        'fijadora',
        'fijadora_phillips',
        'guia_std',
        'guia',
        'punta_copa_std',
        'punta_copa',
        'gota_ranurado',
        'plana_ranurado_phillips',
        'fijadora_ranurado',
        'k-lath',
        'phillips',
        'gota_combinado',
      ]
    >;
    screwType: Schema.Attribute.Enumeration<
      [
        'tuerca',
        'tornillo',
        'perno',
        'varilla_roscada',
        'varilla',
        'pija',
        'rondana',
        'remache',
        'taquete',
        'nudo',
        'guia_std',
        'cilindro',
        'tapon',
        'opresor',
        'accesorios_EPDM',
        'accesorio_pija',
      ]
    >;
    size: Schema.Attribute.String;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedPricing extends Struct.ComponentSchema {
  collectionName: 'components_shared_pricings';
  info: {
    displayName: 'pricing';
    icon: 'shoppingCart';
  };
  attributes: {
    price: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    pricePromotion: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'shared.category': SharedCategory;
      'shared.details': SharedDetails;
      'shared.media': SharedMedia;
      'shared.pricing': SharedPricing;
      'shared.seo': SharedSeo;
    }
  }
}
