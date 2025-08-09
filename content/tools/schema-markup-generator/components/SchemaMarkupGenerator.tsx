import { useState, useMemo } from 'react';
import styles from './SchemaMarkupGenerator.module.css';
import ToolHeader from '../../../../components/Tools/ToolHeader';

interface SchemaData {
  type: string;
  properties: Record<string, string>;
}

interface SchemaProperty {
  name: string;
  label: string;
  type: 'text' | 'url' | 'date' | 'number' | 'textarea';
  required: boolean;
  description: string;
  group?: string;
  placeholder?: string;
}

interface SchemaTypeDefinition {
  type: string;
  description: string;
  properties: SchemaProperty[];
}

const SCHEMA_DEFINITIONS: SchemaTypeDefinition[] = [
  {
    type: 'Product',
    description: 'Use for any product pages on e-commerce sites.',
    properties: [
      {
        name: 'name',
        label: 'Product Name',
        type: 'text',
        required: true,
        description: 'The name of the product',
        group: 'Basic Information',
        placeholder: 'e.g., Ergonomic Office Chair'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        description: 'A description of the product',
        group: 'Basic Information',
        placeholder: 'e.g., Comfortable office chair with adjustable height and lumbar support'
      },
      {
        name: 'brand',
        label: 'Brand',
        type: 'text',
        required: false,
        description: 'The brand of the product',
        group: 'Basic Information',
        placeholder: 'e.g., ErgoMax'
      },
      {
        name: 'image',
        label: 'Product Image URL',
        type: 'url',
        required: true,
        description: 'URL of the product image',
        group: 'Media',
        placeholder: 'https://example.com/images/product.jpg'
      },
      {
        name: 'price',
        label: 'Price',
        type: 'number',
        required: true,
        description: 'The price of the product (numbers only)',
        group: 'Pricing',
        placeholder: '299.99'
      },
      {
        name: 'priceCurrency',
        label: 'Currency',
        type: 'text',
        required: true,
        description: 'The currency (e.g., USD, EUR)',
        group: 'Pricing',
        placeholder: 'USD'
      },
      {
        name: 'availability',
        label: 'Availability',
        type: 'text',
        required: false,
        description: 'Product availability (InStock, OutOfStock, PreOrder)',
        group: 'Inventory',
        placeholder: 'InStock'
      }
    ]
  },
  {
    type: 'Article',
    description: 'Use for blog posts, news articles, or any editorial content.',
    properties: [
      {
        name: 'headline',
        label: 'Headline',
        type: 'text',
        required: true,
        description: 'The title of the article (max 110 characters)',
        group: 'Basic Information',
        placeholder: 'e.g., 10 Tips for Better SEO Performance'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        description: 'A brief summary of the article',
        group: 'Basic Information',
        placeholder: 'e.g., Learn how to improve your website\'s SEO with these actionable tips'
      },
      {
        name: 'author',
        label: 'Author Name',
        type: 'text',
        required: true,
        description: 'The author of the article',
        group: 'Author Information',
        placeholder: 'e.g., Jane Smith'
      },
      {
        name: 'datePublished',
        label: 'Date Published',
        type: 'date',
        required: true,
        description: 'The date the article was first published',
        group: 'Publication Details',
        placeholder: 'YYYY-MM-DD'
      },
      {
        name: 'image',
        label: 'Featured Image URL',
        type: 'url',
        required: true,
        description: 'URL of the article\'s featured image',
        group: 'Media',
        placeholder: 'https://example.com/images/article-image.jpg'
      }
    ]
  },
  {
    type: 'LocalBusiness',
    description: 'Use for local business websites, stores, and service providers.',
    properties: [
      {
        name: 'name',
        label: 'Business Name',
        type: 'text',
        required: true,
        description: 'The name of the local business',
        group: 'Basic Information',
        placeholder: 'e.g., Urban Coffee Shop'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        description: 'A description of the local business',
        group: 'Basic Information',
        placeholder: 'e.g., A cozy coffee shop offering specialty brews and homemade pastries'
      },
      {
        name: 'image',
        label: 'Business Image URL',
        type: 'url',
        required: true,
        description: 'URL of a photo of the business',
        group: 'Media',
        placeholder: 'https://example.com/images/coffee-shop.jpg'
      },
      {
        name: 'telephone',
        label: 'Telephone',
        type: 'text',
        required: false,
        description: 'The telephone number of the business',
        group: 'Contact',
        placeholder: 'e.g., +1-555-123-4567'
      },
      {
        name: 'address',
        label: 'Street Address',
        type: 'text',
        required: true,
        description: 'The street address of the business',
        group: 'Location',
        placeholder: 'e.g., 123 Main Street'
      },
      {
        name: 'addressLocality',
        label: 'City',
        type: 'text',
        required: true,
        description: 'The city where the business is located',
        group: 'Location',
        placeholder: 'e.g., San Francisco'
      },
      {
        name: 'addressRegion',
        label: 'State/Region',
        type: 'text',
        required: true,
        description: 'The state or region where the business is located',
        group: 'Location',
        placeholder: 'e.g., CA'
      },
      {
        name: 'postalCode',
        label: 'Postal Code',
        type: 'text',
        required: true,
        description: 'The postal code of the business location',
        group: 'Location',
        placeholder: 'e.g., 94103'
      }
    ]
  },
  {
    type: 'Organization',
    description: 'Use for company websites, business profiles, and corporate entities.',
    properties: [
      {
        name: 'name',
        label: 'Organization Name',
        type: 'text',
        required: true,
        description: 'The name of the organization',
        group: 'Basic Information',
        placeholder: 'e.g., Acme Corporation'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        description: 'A description of the organization',
        group: 'Basic Information',
        placeholder: 'e.g., Global leader in innovative solutions for...'
      },
      {
        name: 'url',
        label: 'Website URL',
        type: 'url',
        required: true,
        description: 'The URL of the organization\'s website',
        group: 'Basic Information',
        placeholder: 'https://example.com'
      },
      {
        name: 'logo',
        label: 'Logo URL',
        type: 'url',
        required: true,
        description: 'URL of the organization\'s logo image',
        group: 'Media',
        placeholder: 'https://example.com/images/logo.png'
      },
      {
        name: 'telephone',
        label: 'Telephone',
        type: 'text',
        required: false,
        description: 'The telephone number of the organization',
        group: 'Contact',
        placeholder: 'e.g., +1-555-123-4567'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        required: false,
        description: 'The email address of the organization',
        group: 'Contact',
        placeholder: 'contact@example.com'
      },
      {
        name: 'foundingDate',
        label: 'Founding Date',
        type: 'date',
        required: false,
        description: 'The date the organization was founded',
        group: 'Additional Details',
        placeholder: 'YYYY-MM-DD'
      },
      {
        name: 'sameAs',
        label: 'Social Profiles (comma separated URLs)',
        type: 'text',
        required: false,
        description: 'URLs of profiles on social platforms (Facebook, LinkedIn, Twitter, etc.)',
        group: 'Social',
        placeholder: 'https://facebook.com/example, https://twitter.com/example'
      }
    ]
  },
  {
    type: 'Person',
    description: 'Use for personal websites, author pages, and professional profiles.',
    properties: [
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        required: true,
        description: 'The person\'s full name',
        group: 'Basic Information',
        placeholder: 'e.g., John Doe'
      },
      {
        name: 'description',
        label: 'Biography',
        type: 'textarea',
        required: false,
        description: 'A short biography or description of the person',
        group: 'Basic Information',
        placeholder: 'e.g., John Doe is a professional web developer with 10 years of experience...'
      },
      {
        name: 'image',
        label: 'Profile Image URL',
        type: 'url',
        required: true,
        description: 'URL of the person\'s profile image',
        group: 'Media',
        placeholder: 'https://example.com/images/profile.jpg'
      },
      {
        name: 'jobTitle',
        label: 'Job Title',
        type: 'text',
        required: false,
        description: 'The person\'s job title',
        group: 'Professional',
        placeholder: 'e.g., Senior Web Developer'
      },
      {
        name: 'worksFor',
        label: 'Employer',
        type: 'text',
        required: false,
        description: 'Organization the person works for',
        group: 'Professional',
        placeholder: 'e.g., Acme Corporation'
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        required: false,
        description: 'The person\'s email address',
        group: 'Contact',
        placeholder: 'john.doe@example.com'
      },
      {
        name: 'telephone',
        label: 'Telephone',
        type: 'text',
        required: false,
        description: 'The person\'s telephone number',
        group: 'Contact',
        placeholder: 'e.g., +1-555-123-4567'
      },
      {
        name: 'sameAs',
        label: 'Social Profiles (comma separated URLs)',
        type: 'text',
        required: false,
        description: 'URLs of profiles on social platforms (LinkedIn, Twitter, etc.)',
        group: 'Social',
        placeholder: 'https://linkedin.com/in/johndoe, https://twitter.com/johndoe'
      }
    ]
  },
  {
    type: 'FAQPage',
    description: 'Use for FAQ pages with multiple questions and answers.',
    properties: [
      {
        name: 'questionsJson',
        label: 'FAQ Items (JSON Format)',
        type: 'textarea',
        required: true,
        description: 'JSON array of question-answer pairs. Format: [{"question":"Q1?","answer":"A1"},{"question":"Q2?","answer":"A2"}]',
        group: 'FAQ Content',
        placeholder: '[{"question":"What is schema markup?","answer":"Schema markup is code that helps search engines understand your content better."},{"question":"Why use schema markup?","answer":"Schema markup helps your content appear as rich results in search engines."}]'
      }
    ]
  },
  {
    type: 'Event',
    description: 'Use for event pages, conferences, webinars, and concerts.',
    properties: [
      {
        name: 'name',
        label: 'Event Name',
        type: 'text',
        required: true,
        description: 'The name of the event',
        group: 'Basic Information',
        placeholder: 'e.g., Annual Tech Conference 2023'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        description: 'A description of the event',
        group: 'Basic Information',
        placeholder: 'e.g., A 3-day conference featuring industry experts discussing...'
      },
      {
        name: 'startDate',
        label: 'Start Date & Time',
        type: 'text',
        required: true,
        description: 'When the event starts (format: YYYY-MM-DDThh:mm)',
        group: 'Schedule',
        placeholder: 'e.g., 2023-09-15T09:00'
      },
      {
        name: 'endDate',
        label: 'End Date & Time',
        type: 'text',
        required: false,
        description: 'When the event ends (format: YYYY-MM-DDThh:mm)',
        group: 'Schedule',
        placeholder: 'e.g., 2023-09-17T18:00'
      },
      {
        name: 'image',
        label: 'Event Image URL',
        type: 'url',
        required: true,
        description: 'URL of an image representing the event',
        group: 'Media',
        placeholder: 'https://example.com/images/event.jpg'
      },
      {
        name: 'location',
        label: 'Location Name',
        type: 'text',
        required: true,
        description: 'The name of the venue where the event is being held',
        group: 'Location',
        placeholder: 'e.g., Convention Center'
      },
      {
        name: 'locationAddress',
        label: 'Location Address',
        type: 'text',
        required: true,
        description: 'The address of the venue',
        group: 'Location',
        placeholder: 'e.g., 123 Conference Way, San Francisco, CA 94102'
      },
      {
        name: 'offers',
        label: 'Ticket Price',
        type: 'text',
        required: false,
        description: 'The price of tickets for the event',
        group: 'Tickets',
        placeholder: 'e.g., 99.99'
      },
      {
        name: 'priceCurrency',
        label: 'Currency',
        type: 'text',
        required: false,
        description: 'The currency of the ticket price (e.g., USD, EUR)',
        group: 'Tickets',
        placeholder: 'USD'
      },
      {
        name: 'availability',
        label: 'Availability',
        type: 'text',
        required: false,
        description: 'Ticket availability status (InStock, SoldOut, PreSale)',
        group: 'Tickets',
        placeholder: 'InStock'
      },
      {
        name: 'performer',
        label: 'Performer(s)',
        type: 'text',
        required: false,
        description: 'Name(s) of the performer(s)',
        group: 'Additional Details',
        placeholder: 'e.g., John Smith, The Band Name'
      }
    ]
  },
  {
    type: 'Recipe',
    description: 'Use for recipe pages, cooking instructions, and food blogs.',
    properties: [
      {
        name: 'name',
        label: 'Recipe Name',
        type: 'text',
        required: true,
        description: 'The name of the recipe',
        group: 'Basic Information',
        placeholder: 'e.g., Chocolate Chip Cookies'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        description: 'A short description of the recipe',
        group: 'Basic Information',
        placeholder: 'e.g., Delicious homemade chocolate chip cookies that are crispy on the outside and chewy inside.'
      },
      {
        name: 'author',
        label: 'Author Name',
        type: 'text',
        required: true,
        description: 'The author of the recipe',
        group: 'Author',
        placeholder: 'e.g., Jane Smith'
      },
      {
        name: 'image',
        label: 'Recipe Image URL',
        type: 'url',
        required: true,
        description: 'URL of an image of the completed dish',
        group: 'Media',
        placeholder: 'https://example.com/images/cookies.jpg'
      },
      {
        name: 'prepTime',
        label: 'Prep Time',
        type: 'text',
        required: false,
        description: 'The preparation time (format: PTxHyM, e.g., PT15M for 15 minutes)',
        group: 'Time',
        placeholder: 'PT15M'
      },
      {
        name: 'cookTime',
        label: 'Cook Time',
        type: 'text',
        required: false,
        description: 'The cooking time (format: PTxHyM, e.g., PT1H for 1 hour)',
        group: 'Time',
        placeholder: 'PT25M'
      },
      {
        name: 'totalTime',
        label: 'Total Time',
        type: 'text',
        required: false,
        description: 'The total time to prepare the recipe (format: PTxHyM)',
        group: 'Time',
        placeholder: 'PT40M'
      },
      {
        name: 'recipeYield',
        label: 'Yield',
        type: 'text',
        required: false,
        description: 'The quantity or servings produced by the recipe',
        group: 'Details',
        placeholder: 'e.g., 24 cookies'
      },
      {
        name: 'recipeIngredient',
        label: 'Ingredients (one per line)',
        type: 'textarea',
        required: true,
        description: 'The ingredients used (one per line)',
        group: 'Recipe Content',
        placeholder: '2 cups all-purpose flour\n1 cup butter, softened\n3/4 cup sugar\n2 eggs\n2 cups chocolate chips'
      },
      {
        name: 'recipeInstructions',
        label: 'Instructions (one step per line)',
        type: 'textarea',
        required: true,
        description: 'The steps to make the recipe (one per line)',
        group: 'Recipe Content',
        placeholder: 'Preheat oven to 350°F.\nMix butter and sugar until creamy.\nAdd eggs and vanilla, mix well.\nStir in flour and chocolate chips.\nDrop by rounded tablespoons onto baking sheets.\nBake for 10-12 minutes or until golden brown.'
      }
    ]
  },
  {
    type: 'WebSite',
    description: 'Use for the homepage of a website to enable sitelinks search box.',
    properties: [
      {
        name: 'name',
        label: 'Website Name',
        type: 'text',
        required: true,
        description: 'The name of the website',
        group: 'Basic Information',
        placeholder: 'e.g., Example.com'
      },
      {
        name: 'url',
        label: 'Website URL',
        type: 'url',
        required: true,
        description: 'The URL of the website',
        group: 'Basic Information',
        placeholder: 'https://example.com'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        description: 'A description of the website',
        group: 'Basic Information',
        placeholder: 'e.g., Example.com provides information about...'
      },
      {
        name: 'searchAction',
        label: 'Search URL Template',
        type: 'url',
        required: false,
        description: 'URL template for searches (use {search_term_string} as placeholder)',
        group: 'Search Box',
        placeholder: 'https://example.com/search?q={search_term_string}'
      }
    ]
  },
  {
    type: 'HowTo',
    description: 'Use for step-by-step instructions, guides, and tutorials.',
    properties: [
      {
        name: 'name',
        label: 'How-To Title',
        type: 'text',
        required: true,
        description: 'The title of the how-to guide',
        group: 'Basic Information',
        placeholder: 'e.g., How to Change a Flat Tire'
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        description: 'A description of the how-to guide',
        group: 'Basic Information',
        placeholder: 'e.g., A complete guide to safely changing a flat tire on your vehicle.'
      },
      {
        name: 'image',
        label: 'Main Image URL',
        type: 'url',
        required: true,
        description: 'URL of an image representing the how-to',
        group: 'Media',
        placeholder: 'https://example.com/images/flat-tire.jpg'
      },
      {
        name: 'estimatedCost',
        label: 'Estimated Cost',
        type: 'text',
        required: false,
        description: 'The estimated cost of completing the how-to (e.g., "10 USD")',
        group: 'Details',
        placeholder: 'e.g., 10 USD'
      },
      {
        name: 'totalTime',
        label: 'Total Time',
        type: 'text',
        required: false,
        description: 'The total time needed (format: PTxHyM, e.g., PT30M for 30 minutes)',
        group: 'Time',
        placeholder: 'PT30M'
      },
      {
        name: 'supply',
        label: 'Supplies Needed (one per line)',
        type: 'textarea',
        required: false,
        description: 'List of supplies needed (one per line)',
        group: 'Supplies & Tools',
        placeholder: 'Spare tire\nJack\nLug wrench\nWheel wedges'
      },
      {
        name: 'tool',
        label: 'Tools Required (one per line)',
        type: 'textarea',
        required: false,
        description: 'List of tools required (one per line)',
        group: 'Supplies & Tools',
        placeholder: 'Tire iron\nCar jack\nTorque wrench'
      },
      {
        name: 'steps',
        label: 'Steps (one per line)',
        type: 'textarea',
        required: true,
        description: 'The steps to complete the how-to (one per line)',
        group: 'Step-by-Step',
        placeholder: 'Park your car on a flat surface and engage the parking brake.\nPlace wheel wedges around the wheel diagonal from the flat tire.\nRemove the hubcap and loosen the lug nuts.\nPlace the jack under the car frame and raise the car.\nRemove the lug nuts and the flat tire.\nMount the spare tire and tighten the lug nuts.\nLower the car and tighten the lug nuts fully.\nReplace the hubcap.'
      }
    ]
  }
];

export default function SchemaMarkupGenerator() {
  const [activeTab, setActiveTab] = useState('editor');
  const [schemaData, setSchemaData] = useState<SchemaData>({
    type: 'Product',
    properties: {}
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatedSchema, setGeneratedSchema] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [showRichPreview, setShowRichPreview] = useState(true);
  const [showJsonPreview, setShowJsonPreview] = useState(true);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setSchemaData({
      type: newType,
      properties: {}
    });
    setErrors({});
    setGeneratedSchema('');
  };

  const handlePropertyChange = (property: string, value: string) => {
    setSchemaData(prev => ({
      ...prev,
      properties: {
        ...prev.properties,
        [property]: value
      }
    }));

    // Clear error for this property when user starts typing
    if (errors[property]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[property];
        return newErrors;
      });
    }
  };

  const validateSchema = (): boolean => {
    const selectedSchemaType = SCHEMA_DEFINITIONS.find(schema => schema.type === schemaData.type);
    if (!selectedSchemaType) return false;

    const newErrors: Record<string, string> = {};
    
    selectedSchemaType.properties.forEach(property => {
      if (property.required && !schemaData.properties[property.name]) {
        newErrors[property.name] = `${property.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateSchema = () => {
    if (!validateSchema()) {
      return;
    }

    const selectedSchemaType = SCHEMA_DEFINITIONS.find(schema => schema.type === schemaData.type);
    if (!selectedSchemaType) return;

    const schemaObj: any = {
      "@context": "https://schema.org",
      "@type": schemaData.type
    };

    Object.entries(schemaData.properties).forEach(([key, value]) => {
      if (value) {
        const property = selectedSchemaType.properties.find(p => p.name === key);
        
        if (property) {
          if (property.type === 'number') {
            schemaObj[key] = parseFloat(value);
          } else if (property.type === 'date') {
            schemaObj[key] = value; // Keep date as string
          } else {
            schemaObj[key] = value;
          }
        }
      }
    });

    // Add special handling for common schema types
    if (schemaData.type === 'Product' && schemaData.properties.price && schemaData.properties.priceCurrency) {
      schemaObj.offers = {
        "@type": "Offer",
        "price": parseFloat(schemaData.properties.price),
        "priceCurrency": schemaData.properties.priceCurrency
      };
      
      if (schemaData.properties.availability) {
        schemaObj.offers.availability = `https://schema.org/${schemaData.properties.availability}`;
      }
      
      // Remove the now duplicated properties
      delete schemaObj.price;
      delete schemaObj.priceCurrency;
      delete schemaObj.availability;
    }

    setGeneratedSchema(JSON.stringify(schemaObj, null, 2));
    setActiveTab('preview');
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(generatedSchema);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const navigateToTab = (nextTab: 'editor' | 'preview' | 'validate') => {
    setActiveTab(nextTab);
  };

  const getFormattedCode = () => {
    if (!generatedSchema) return '';

    const scriptTag = `<script type="application/ld+json">
${generatedSchema}
</script>`;

    return scriptTag;
  };

  // Define a function to get preview-ready schema
  const getPreviewSchema = () => {
    const selectedSchemaType = SCHEMA_DEFINITIONS.find(schema => schema.type === schemaData.type);
    if (!selectedSchemaType) return '{}';

    const schemaObj: any = {
      "@context": "https://schema.org",
      "@type": schemaData.type
    };

    Object.entries(schemaData.properties).forEach(([key, value]) => {
      if (value) {
        schemaObj[key] = value;
      }
    });

    return JSON.stringify(schemaObj, null, 2);
  };

  // Group properties by their group
  const groupedProperties = useMemo(() => {
    if (!schemaData.type) return {};

    const selectedSchemaType = SCHEMA_DEFINITIONS.find(schema => schema.type === schemaData.type);
    if (!selectedSchemaType) return {};

    return selectedSchemaType.properties.reduce<Record<string, SchemaProperty[]>>((groups, property) => {
      const group = property.group || 'Other';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(property);
      return groups;
    }, {});
  }, [schemaData.type]);

  return (
    <div className={styles.container}>
      <ToolHeader 
        title="Schema Markup Generator" 
        description="Create structured data for your website to improve search engine visibility"
      />

      <div className={styles.toolContainer}>
        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'editor' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            Editor
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'preview' ? styles.activeTab : ''}`}
            onClick={() => navigateToTab('preview')}
          >
            Code
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'validate' ? styles.activeTab : ''}`}
            onClick={() => navigateToTab('validate')}
          >
            Validate
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'editor' && (
            <>
              <div className={styles.editorPreviewHeader}>
                <h2>Schema Markup Generator</h2>
                <button 
                  className={styles.togglePreviewButton}
                  onClick={() => setShowPreview(!showPreview)}
                  aria-label={showPreview ? "Hide Preview" : "Show Preview"}
                >
                  {showPreview ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 15l-6-6-6 6"/>
                      </svg>
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                      Show Preview
                    </>
                  )}
                </button>
              </div>
              
              <div className={styles.sideBySideLayout} style={{ gridTemplateColumns: showPreview ? '3fr 2fr' : '1fr' }}>
                <div className={styles.editorSection}>
                  <div className={styles.schemaSelector}>
                    <label htmlFor="schemaType">Schema Type</label>
                    <select
                      id="schemaType"
                      value={schemaData.type}
                      onChange={handleTypeChange}
                    >
                      {SCHEMA_DEFINITIONS.map(def => (
                        <option key={def.type} value={def.type}>
                          {def.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.schemaDescription}>
                    {SCHEMA_DEFINITIONS.find(schema => schema.type === schemaData.type)?.description}
                  </div>

                  <div className={styles.formFields}>
                    {/* Group fields by category */}
                    {groupedProperties && Object.entries(groupedProperties).map(([group, fields]) => (
                      <div key={group} className={styles.fieldGroup}>
                        <h3 className={styles.fieldGroupTitle}>{group}</h3>
                        {fields.map(field => {
                          // Add field importance indicator
                          const isRequired = field.required;
                          const importanceClass = isRequired 
                            ? styles.fieldImportanceHigh 
                            : styles.fieldImportanceMedium;
                          
                          return (
                            <div key={field.name} className={styles.formField}>
                              <label htmlFor={field.name}>
                                {field.label}
                                {!isRequired && <span className={styles.optionalLabel}> (optional)</span>}
                                <span className={`${styles.fieldImportance} ${importanceClass}`}>
                                  {isRequired ? 'High importance' : 'Medium importance'}
                                </span>
                              </label>
                              {field.type === 'textarea' ? (
                                <textarea
                                  id={field.name}
                                  value={schemaData.properties[field.name] || ''}
                                  onChange={(e) => handlePropertyChange(field.name, e.target.value)}
                                  placeholder={field.placeholder}
                                  rows={4}
                                />
                              ) : field.type === 'date' ? (
                                <input
                                  type="date"
                                  id={field.name}
                                  value={schemaData.properties[field.name] || ''}
                                  onChange={(e) => handlePropertyChange(field.name, e.target.value)}
                                />
                              ) : (
                                <input
                                  type={field.type}
                                  id={field.name}
                                  value={schemaData.properties[field.name] || ''}
                                  onChange={(e) => handlePropertyChange(field.name, e.target.value)}
                                  placeholder={field.placeholder}
                                />
                              )}
                              <p className={styles.fieldDescription}>{field.description}</p>
                              {errors[field.name] && (
                                <div className={styles.errorMessage}>{errors[field.name]}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Preview section - only show if showPreview is true */}
                {showPreview && (
                  <div className={styles.previewSection}>
                    <h3 className={styles.previewHeading}>Live Preview</h3>
                    <div className={styles.previewToggleButtons}>
                      <button 
                        className={`${styles.previewToggleButton} ${showJsonPreview ? styles.previewToggleActive : ''}`}
                        onClick={() => setShowJsonPreview(!showJsonPreview)}
                      >
                        {showJsonPreview ? 'Hide JSON-LD' : 'Show JSON-LD'}
                      </button>
                      <button 
                        className={`${styles.previewToggleButton} ${showRichPreview ? styles.previewToggleActive : ''}`}
                        onClick={() => setShowRichPreview(!showRichPreview)}
                      >
                        {showRichPreview ? 'Hide Rich Result' : 'Show Rich Result'}
                      </button>
                    </div>
                    <div className={styles.previewContainer}>
                      {showJsonPreview && (
                        <div className={styles.previewCode}>
                          <div className={styles.codePreviewHeader}>
                            <h4>Generated JSON-LD</h4>
                            <div className={styles.previewFormat}>
                              <code>application/ld+json</code>
                            </div>
                          </div>
                          <pre className={styles.codeBlock}>
                            <code>{getPreviewSchema()}</code>
                          </pre>
                        </div>
                      )}
                      
                      {showRichPreview && (
                        <div className={styles.richResultsPreview}>
                          <h4>Possible Rich Result Preview</h4>
                          <div className={styles.richResultContainer}>
                            {schemaData.type === 'Product' && (
                              <div className={styles.productPreview}>
                                <div className={styles.productTitle}>
                                  {schemaData.properties.name || 'Product Name'}
                                </div>
                                <div className={styles.ratingPreview}>
                                  {schemaData.properties.aggregateRating && (
                                    <>★★★★★ {schemaData.properties.aggregateRating}/5</>
                                  )}
                                </div>
                                <div className={styles.pricePreview}>
                                  {schemaData.properties.price && (
                                    <>${schemaData.properties.price}</>
                                  )}
                                  {schemaData.properties.priceCurrency && (
                                    <> {schemaData.properties.priceCurrency}</>
                                  )}
                                </div>
                                <div className={styles.availabilityPreview}>
                                  {schemaData.properties.availability || 'In stock'}
                                </div>
                              </div>
                            )}
                            
                            {schemaData.type === 'Article' && (
                              <div className={styles.articlePreview}>
                                <div className={styles.articleTitle}>
                                  {schemaData.properties.headline || schemaData.properties.name || 'Article Title'}
                                </div>
                                <div className={styles.articleMeta}>
                                  {schemaData.properties.author && (
                                    <span className={styles.authorPreview}>By {schemaData.properties.author}</span>
                                  )}
                                  {schemaData.properties.datePublished && (
                                    <span className={styles.datePreview}>{schemaData.properties.datePublished}</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {schemaData.type === 'LocalBusiness' && (
                              <div className={styles.businessPreview}>
                                <div className={styles.businessTitle}>
                                  {schemaData.properties.name || 'Business Name'}
                                </div>
                                <div className={styles.businessAddress}>
                                  {schemaData.properties.address || '123 Main St, City, State'}
                                </div>
                                <div className={styles.businessPhone}>
                                  {schemaData.properties.telephone || '(555) 123-4567'}
                                </div>
                                <div className={styles.businessHours}>
                                  {schemaData.properties.openingHours || 'Mon-Fri: 9AM-5PM'}
                                </div>
                              </div>
                            )}
                            
                            {(schemaData.type !== 'Product' && schemaData.type !== 'Article' && schemaData.type !== 'LocalBusiness') && (
                              <div className={styles.genericPreview}>
                                <div className={styles.genericTitle}>
                                  {schemaData.properties.name || `${schemaData.type} Name`}
                                </div>
                                <div className={styles.genericDescription}>
                                  {schemaData.properties.description || 'Description will appear here'}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className={styles.previewNote}>
                            Note: Actual appearance in search results may vary. Google and other search engines decide if and how to display rich results.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'preview' && (
            <div className={styles.previewTab}>
              <div className={styles.editorPreviewHeader}>
                <h2>Schema Markup Code</h2>
              </div>
              
              <div className={styles.previewSection}>
                <div className={styles.implementationContainer}>
                  <h3>Implementation Code</h3>
                  <pre className={styles.codeBlock}>
                    <code>{getFormattedCode() || '<script type="application/ld+json">\n  {}\n</script>'}</code>
                  </pre>
                  <div className={styles.previewActions}>
                    <button 
                      className={styles.copyButton} 
                      onClick={handleCopyClick}
                      disabled={copied}
                    >
                      {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                  </div>
                </div>
                
                <div className={styles.implementationGuide}>
                  <h3>How to Implement</h3>
                  <ol>
                    <li>Copy the code above</li>
                    <li>Paste it between the <code>&lt;head&gt;</code> tags of your HTML document</li>
                    <li>Validate your schema using Google's Rich Results Test</li>
                  </ol>
                  <div className={styles.implementationTip}>
                    <strong>Tip:</strong> Place this code in the <code>&lt;head&gt;</code> section of your webpage. This ensures search engines can quickly find and interpret your structured data.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'validate' && (
            <div className={styles.validateTab}>
              <div className={styles.editorPreviewHeader}>
                <h2>Validate Your Schema Markup</h2>
              </div>
              
              <div className={styles.validationSection}>
                <div className={styles.validationContainer}>
                  <p>To ensure your schema markup is correct and error-free, validate it using these tools:</p>
                  
                  <div className={styles.validationTool}>
                    <h3>Google Rich Results Test</h3>
                    <p>Test your schema markup and see how it appears in Google search results.</p>
                    <a 
                      href="https://search.google.com/test/rich-results" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.validationLink}
                    >
                      Open Google Rich Results Test
                    </a>
                  </div>
                  
                  <div className={styles.validationTool}>
                    <h3>Schema.org Validator</h3>
                    <p>Check if your markup conforms to schema.org standards.</p>
                    <a 
                      href="https://validator.schema.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.validationLink}
                    >
                      Open Schema.org Validator
                    </a>
                  </div>
                  
                  <div className={styles.validationNote}>
                    <h4>How to use validators:</h4>
                    <ol>
                      <li>Copy your generated schema markup</li>
                      <li>Paste it into the validator tool</li>
                      <li>Fix any errors or warnings reported</li>
                      <li>Update your implementation accordingly</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className={styles.navigationButtons}>
                <button 
                  className={styles.backButton} 
                  onClick={() => navigateToTab('editor')}
                >
                  <span className={styles.buttonIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </span> Back to Editor
                </button>
                <button 
                  className={styles.primaryButton} 
                  onClick={() => window.open('https://search.google.com/test/rich-results', '_blank')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg> Open Rich Results Test
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 