// OpenGL Vertex Shader - cockroach.vert
#version 330 core

layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform float time;

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoord;
out vec3 WorldPos;

// Vertex displacement for realistic surface detail
vec3 displace(vec3 pos, vec3 normal) {
    // Chitin surface bumps
    float noise1 = sin(pos.x * 20.0) * sin(pos.y * 15.0) * sin(pos.z * 18.0);
    float noise2 = sin(pos.x * 50.0 + time * 0.5) * sin(pos.y * 40.0 + time * 0.3);
    
    float displacement = (noise1 * 0.02 + noise2 * 0.005);
    return pos + normal * displacement;
}

void main() {
    // Apply surface displacement
    vec3 displacedPos = displace(aPos, aNormal);
    
    FragPos = vec3(model * vec4(displacedPos, 1.0));
    Normal = mat3(transpose(inverse(model))) * aNormal;
    WorldPos = FragPos;
    TexCoord = aTexCoord;
    
    gl_Position = projection * view * vec4(FragPos, 1.0);
}

// OpenGL Fragment Shader - cockroach.frag
#version 330 core

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoord;
in vec3 WorldPos;

uniform vec3 lightPos;
uniform vec3 viewPos;
uniform float time;
uniform float aggro;

out vec4 FragColor;

// Noise functions for procedural textures
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Realistic cockroach material
vec3 calculateCockroachMaterial(vec2 uv, vec3 normal, vec3 viewDir, vec3 lightDir) {
    // Base cockroach colors - realistic brown tones
    vec3 darkBrown = vec3(0.08, 0.04, 0.02);    // Deep brown-black
    vec3 mediumBrown = vec3(0.15, 0.08, 0.04);  // Medium brown
    vec3 lightBrown = vec3(0.25, 0.15, 0.08);   // Lighter brown highlights
    
    // Surface texture variation using multiple noise octaves
    float baseNoise = noise(uv * 30.0);
    float detailNoise = noise(uv * 120.0) * 0.5;
    float microNoise = noise(uv * 300.0) * 0.25;
    
    // Combine noise for natural surface variation
    float surfaceVariation = baseNoise + detailNoise + microNoise;
    
    // Mix base colors based on surface variation
    vec3 baseColor = mix(darkBrown, mediumBrown, surfaceVariation);
    baseColor = mix(baseColor, lightBrown, smoothstep(0.7, 1.0, surfaceVariation));
    
    // Fresnel effect for iridescence on wing covers and segments
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    
    // Realistic iridescent colors (green, blue, purple shift)
    vec3 iridescent = vec3(
        0.1 + 0.4 * sin(fresnel * 6.28 + time + uv.x * 10.0),
        0.2 + 0.5 * sin(fresnel * 6.28 + time + 2.0 + uv.y * 8.0),
        0.3 + 0.3 * sin(fresnel * 6.28 + time + 4.0)
    );
    
    // Lighting calculations
    float NdotL = max(dot(normal, lightDir), 0.0);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float NdotH = max(dot(normal, halfwayDir), 0.0);
    
    // Specular highlights - chitin has some shine
    float specularStrength = 0.3;
    float shininess = 32.0;
    float spec = pow(NdotH, shininess) * specularStrength;
    
    // Subsurface scattering approximation for translucent parts
    float backlight = max(0.0, dot(-lightDir, viewDir));
    vec3 subsurface = baseColor * pow(backlight, 4.0) * 0.2;
    
    // Rim lighting for edge definition
    float rimPower = 2.0;
    float rimIntensity = pow(1.0 - max(dot(normal, viewDir), 0.0), rimPower);
    vec3 rimColor = lightBrown * rimIntensity * 0.3;
    
    // Combine all lighting components
    vec3 ambient = baseColor * 0.15;
    vec3 diffuse = baseColor * NdotL * 0.8;
    vec3 specular = vec3(spec) * 0.5;
    vec3 iridescence = iridescent * fresnel * 0.4;
    
    return ambient + diffuse + specular + iridescence + subsurface + rimColor;
}

// Environmental effects
vec3 applyEnvironmentalEffects(vec3 color, vec3 worldPos) {
    // Distance-based atmospheric perspective
    float distance = length(viewPos - worldPos);
    float fogFactor = exp(-distance * 0.01);
    vec3 fogColor = vec3(0.05, 0.05, 0.08);
    color = mix(fogColor, color, fogFactor);
    
    return color;
}

void main() {
    vec3 normal = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    vec3 viewDir = normalize(viewPos - FragPos);
    
    // Calculate realistic cockroach material
    vec3 color = calculateCockroachMaterial(TexCoord, normal, viewDir, lightDir);
    
    // Apply environmental effects
    color = applyEnvironmentalEffects(color, WorldPos);
    
    // Aggro mode - threat display with bioluminescent-like effect
    if (aggro > 0.0) {
        vec3 aggroColor = vec3(1.0, 0.2, 0.0); // Angry red-orange
        vec3 warningGlow = vec3(0.8, 0.1, 0.0);
        
        // Pulsing threat display
        float pulse = sin(time * 8.0) * 0.5 + 0.5;
        vec3 threatColor = mix(aggroColor, warningGlow, pulse);
        
        // Mix with base color and add glow
        color = mix(color, threatColor, aggro * 0.6);
        color += threatColor * aggro * 0.4 * pulse;
        
        // Add threatening edge glow
        float edgeGlow = pow(1.0 - max(dot(normal, viewDir), 0.0), 1.5);
        color += threatColor * edgeGlow * aggro * 0.3;
    }
    
    // Tone mapping for realistic exposure
    color = color / (color + vec3(1.0));
    
    // Gamma correction
    color = pow(color, vec3(1.0/2.2));
    
    FragColor = vec4(color, 1.0);
}