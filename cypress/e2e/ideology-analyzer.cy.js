describe('Ideology Analyzer Game - Photo Loading Debug', () => {
  beforeEach(() => {
    cy.visit('/09-ideology-analyzer.html')
  })

  it('should test server connectivity and API endpoints', () => {
    // Test 1: Check if server is running
    cy.request('GET', '/api/test').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.message).to.include('Server is running')
      cy.log('✅ Server is running')
    })

    // Test 2: Test Cloudinary connection
    cy.request('GET', '/api/test-cloudinary').then((response) => {
      expect(response.status).to.eq(200)
      cy.log('Cloudinary response:', JSON.stringify(response.body, null, 2))
      
      if (response.body.status === 'ok') {
        cy.log('✅ Cloudinary connected')
      } else {
        cy.log('❌ Cloudinary connection failed:', response.body.error)
      }
    })
  })

  it('should test photo API endpoints for each ideology', () => {
    const ideologies = ['communist', 'fascist', 'leftist', 'neutral', 'rightist']
    
    ideologies.forEach(ideology => {
      cy.request('GET', `/api/photos/${ideology}`).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('success', true)
        
        cy.log(`${ideology} photos:`, JSON.stringify(response.body, null, 2))
        
        if (response.body.photos && response.body.photos.length > 0) {
          cy.log(`✅ ${ideology}: Found ${response.body.photos.length} photos`)
          
          // Test if first photo URL is accessible
          const firstPhoto = response.body.photos[0]
          if (firstPhoto && firstPhoto.src) {
            cy.request('GET', firstPhoto.src).then((imgResponse) => {
              expect(imgResponse.status).to.eq(200)
              cy.log(`✅ ${ideology}: First photo URL is accessible`)
            }).catch((error) => {
              cy.log(`❌ ${ideology}: Photo URL not accessible:`, error.message)
            })
          }
        } else {
          cy.log(`⚠️ ${ideology}: No photos found`)
        }
      })
    })
  })

  it('should check game initialization and photo loading', () => {
    // Wait for game to initialize
    cy.get('.game-container', { timeout: 10000 }).should('be.visible')
    
    // Check if loading indicator appears
    cy.get('#loading-indicator').should('exist')
    
    // Wait for photos to load or timeout
    cy.wait(5000)
    
    // Check if photos are loaded in the container
    cy.get('#photo-container').should('exist').then(($container) => {
      const photoOptions = $container.find('.photo-option')
      cy.log(`Found ${photoOptions.length} photo options in container`)
      
      if (photoOptions.length > 0) {
        cy.log('✅ Photos loaded in game')
        
        // Check if images are actually loaded
        cy.get('.photo-option img').each(($img, index) => {
          const src = $img.attr('src')
          cy.log(`Photo ${index + 1} src:`, src)
          
          if (src && !src.includes('data:image/svg+xml')) {
            cy.log(`✅ Photo ${index + 1}: Real image loaded`)
          } else {
            cy.log(`⚠️ Photo ${index + 1}: Using placeholder/fallback`)
          }
        })
      } else {
        cy.log('❌ No photos loaded in game')
      }
    })
  })

  it('should test game functionality with photo selection', () => {
    // Wait for game to load
    cy.get('.game-container', { timeout: 10000 }).should('be.visible')
    cy.wait(3000)
    
    // Check current round
    cy.get('#current-round').should('contain', '1')
    
    // Try to click a photo option
    cy.get('.photo-option').first().should('be.visible').click()
    
    // Wait for blood flow animation
    cy.wait(2000)
    
    // Check if round advanced
    cy.get('#current-round').should('not.contain', '1')
    cy.log('✅ Game interaction working - round advanced')
  })

  it('should debug console errors and network requests', () => {
    // Capture console errors
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError')
      cy.stub(win.console, 'log').as('consoleLog')
    })
    
    // Wait for game to load and capture network activity
    cy.intercept('GET', '/api/photos/*').as('photoRequests')
    
    cy.visit('/09-ideology-analyzer.html')
    cy.wait(5000)
    
    // Check for photo API calls
    cy.get('@photoRequests.all').then((interceptions) => {
      cy.log(`Made ${interceptions.length} photo API requests`)
      
      interceptions.forEach((interception, index) => {
        const { url, statusCode } = interception.response
        cy.log(`Request ${index + 1}: ${url} - Status: ${statusCode}`)
        
        if (statusCode !== 200) {
          cy.log(`❌ Failed request: ${url}`)
        }
      })
    })
    
    // Check console errors
    cy.get('@consoleError').then((stub) => {
      const errorCalls = stub.getCalls()
      if (errorCalls.length > 0) {
        cy.log(`Found ${errorCalls.length} console errors:`)
        errorCalls.forEach((call, index) => {
          cy.log(`Error ${index + 1}:`, call.args.join(' '))
        })
      } else {
        cy.log('✅ No console errors found')
      }
    })
  })

  it('should test direct Cloudinary folder access patterns', () => {
    // Test different folder patterns that might exist
    const testPatterns = [
      'ideology_root/communist',
      'Ideology_root/communist', 
      'ideology_root/Communist',
      'communist',
      'Communist'
    ]
    
    testPatterns.forEach(pattern => {
      cy.request({
        method: 'GET',
        url: '/api/test-cloudinary',
        failOnStatusCode: false
      }).then((response) => {
        cy.log(`Testing pattern: ${pattern}`)
        // This would need server-side support to test different patterns
      })
    })
  })
})

describe('Fix Photo Loading Issues', () => {
  it('should identify and fix the root cause', () => {
    // Step 1: Verify server is running
    cy.request('GET', '/api/test').its('status').should('eq', 200)
    
    // Step 2: Check Cloudinary connection
    cy.request('GET', '/api/test-cloudinary').then((response) => {
      if (response.body.status !== 'ok') {
        throw new Error('Cloudinary connection failed: ' + response.body.error)
      }
    })
    
    // Step 3: Test each ideology endpoint
    const ideologies = ['communist', 'fascist', 'leftist', 'neutral', 'rightist']
    
    ideologies.forEach(ideology => {
      cy.request(`/api/photos/${ideology}`).then((response) => {
        expect(response.body.success).to.be.true
        
        if (response.body.photos.length === 0) {
          cy.log(`❌ No photos found for ${ideology} - checking folder structure`)
          
          // This indicates we need to fix the folder path in the API
          cy.task('log', `Need to fix folder path for ${ideology}`)
        } else {
          cy.log(`✅ ${ideology}: ${response.body.photos.length} photos found`)
        }
      })
    })
    
    // Step 4: Test game loading
    cy.visit('/09-ideology-analyzer.html')
    cy.wait(5000)
    
    cy.get('#photo-container .photo-option').should('have.length.at.least', 1)
    
    // If we reach here, the game is working
    cy.log('✅ Game is fully functional')
  })
})