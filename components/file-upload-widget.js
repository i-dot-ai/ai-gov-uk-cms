// File Upload Widget - Stores JSON data for preSave processing
CMS.registerWidget({
  name: "file_upload_json",
  controlComponent: createClass({
    getInitialState: function() {
      return {
        error: '',
        success: '',
        jsonData: null,
        showingExample: false
      };
    },

    handleFileUpload: function(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (file.type !== 'application/json') {
        this.setState({ error: 'Please upload a JSON file', success: '' });
        return;
      }

      this.setState({ error: '', success: '' });

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          
          this.validateJsonData(jsonData);
          
          // Store the JSON data using the widget's onChange method
          // This will be available in the entry data for preSave processing
          if (this.props.onChange) {
            this.props.onChange(JSON.stringify(jsonData));
          }
          
          this.setState({ 
            success: `JSON data loaded successfully! Save the entry to apply the data to all fields.`, 
            error: '',
            jsonData: jsonData,
            showingExample: false
          });
          
        } catch (error) {
          this.setState({ 
            error: `Error parsing JSON: ${error.message}`,
            success: '',
            jsonData: null,
            showingExample: false
          });
        }
      };

      reader.readAsText(file);
    },

    validateJsonData: function(data) {

      if (!data || typeof data !== 'object') {
        throw new Error('JSON must be a valid object');
      }
      
      if (!data.title || !data.synopsis) {
        throw new Error('JSON must contain at least "title" and "synopsis" fields');
      }
      
      const validSelectOptions = {
        governmentBody: ["UK Government", "Local Government", "Welsh Government", "Scottish Government", "Northern Ireland Executive"],
        userGroup: ["Civil Servants", "Wider Public Sector", "General Public"],
        useCaseType: ["Specific", "Reusable"],
        typeOfTechnology: ["Generative AI", "Machine Learning", "Data or Infrastructure", "Other"],
        impact: ["Cost Savings", "Time Savings", "Improved Efficiency", "Better Customer Experience"],
        phase: ["Discovery", "Alpha", "Beta", "Live", "Retired"]
      };

      Object.entries(validSelectOptions).forEach(([field, validOptions]) => {
        if (data[field]) {
          if (field === 'impact' && Array.isArray(data[field])) {
            data[field].forEach(value => {
              if (!validOptions.includes(value)) {
                throw new Error(`Invalid value for ${field}: ${value}. Valid options: ${validOptions.join(', ')}`);
              }
            });
          } else if (!validOptions.includes(data[field])) {
            throw new Error(`Invalid value for ${field}: ${data[field]}. Valid options: ${validOptions.join(', ')}`);
          }
        }
      });

      if (data.links && Array.isArray(data.links)) {
        data.links.forEach((link, index) => {
          if (!link.text || !link.url) {
            throw new Error(`Link at index ${index} must have both 'text' and 'url' properties`);
          }
        });
      }
    },

    toggleShowExample: function() {
      if (this.state.showingExample) {
        this.setState({
          jsonData: null,
          preview: '',
          fileName: '',
          showingExample: false
        });
      } else {
        const template = {
          title: "Example Use Case Title",
          synopsis: "A short one line summary to show on the cards",
          organisation: "Example Department/Organisation",
          governmentBody: "UK Government",
          userGroup: "Civil Servants",
          useCaseType: "Specific",
          typeOfTechnology: "Generative AI",
          impact: ["Time Savings", "Improved Efficiency"],
          phase: "Alpha",
          challenge: "Description of the challenge that needed solving...",
          solution: "Description of the AI solution that was implemented...",
          results: "Description of the results and outcomes...",
          learnings: "Key insights and lessons learned...",
          links: [
            {
              text: "Project Repository",
              url: "https://github.com/example/project"
            },
            {
              text: "Case Study",
              url: "https://example.com/case-study"
            }
          ]
        };

        this.setState({
          jsonData: template,
          preview: JSON.stringify(template, null, 2),
          showingExample: true
        });
      }
    },

    render: function() {
      return h('div', {
        style: { 
          padding: '16px', 
          border: '1px solid #ccc', 
          borderRadius: '4px', 
          marginBottom: '16px',
        }
      }, [
        h('div', {
          style: { marginBottom: '12px' }
        }, [
          h('button', {
            type: 'button',
            onClick: this.toggleShowExample,
            style: {
              padding: '8px 16px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '8px'
            }
          }, this.state.showingExample ? 'Hide Example JSON' : 'Show Example JSON'),
          
          h('label', {
            style: {
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }
          }, [
            'Upload JSON File',
            h('input', {
              type: 'file',
              accept: '.json',
              onChange: this.handleFileUpload,
              style: { display: 'none' }
            })
          ])
        ]),

        this.state.error && h('div', {
          style: {
            padding: '8px',
            backgroundColor: '#ffe6e6',
            border: '1px solid #ff6b6b',
            borderRadius: '4px',
            color: '#d63031',
            fontSize: '14px',
            marginBottom: '8px'
          }
        }, this.state.error),

        this.state.success && h('div', {
          style: {
            padding: '8px',
            backgroundColor: '#e6ffe6',
            border: '1px solid #6bb46b',
            borderRadius: '4px',
            color: '#2d7a2d',
            fontSize: '14px',
            marginBottom: '8px'
          }
        }, this.state.success),

        this.state.jsonData && h('div', {
          style: {
            padding: '8px',
            backgroundColor: '#f0f8ff',
            border: '1px solid #007acc',
            borderRadius: '4px',
            fontSize: '12px',
            marginBottom: '8px'
          }
        }, [
          h('strong', {}, 'Loaded data preview: '),
          h('pre', {
            style: {
              margin: '4px 0 0 0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }
          }, JSON.stringify(this.state.jsonData, null, 2))
        ]),

        h('div', {
          style: { 
            fontSize: '12px', 
            color: '#666' 
          }
        }, 'Upload a JSON file to automatically populate all use case fields when you save the entry.')
      ]);
    }
  }),
});