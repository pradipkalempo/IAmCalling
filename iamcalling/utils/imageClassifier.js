// Comprehensive Image Classification Module
export const ideologyClassifier = {
    communist: [
        'mao', 'zedong', 'stalin', 'castro', 'che', 'guevara', 'lenin', 'kim', 'sung', 'jong',
        'ho_chi_minh', 'tito', 'ceausescu', 'brezhnev', 'khrushchev', 'marx', 'engels',
        'pol_pot', 'enver_hoxha', 'fidel', 'raul', 'communist', 'marxist', 'bolshevik'
    ],
    
    fascist: [
        'hitler', 'mussolini', 'franco', 'pinochet', 'videla', 'salazar', 'antonescu',
        'horthy', 'pavelić', 'quisling', 'mosley', 'fascist', 'nazi', 'falange'
    ],
    
    leftist: [
        'bernie', 'sanders', 'aoc', 'cortez', 'corbyn', 'melenchon', 'tsipras',
        'surya_sen', 'abul_kalam_azad', 'bhagat_singh', 'chandrashekhar_azad', 'subhas_bose',
        'jawaharlal_nehru', 'indira_gandhi', 'socialist', 'progressive'
    ],
    
    rightist: [
        'trump', 'reagan', 'thatcher', 'churchill', 'modi', 'shah', 'yogi',
        'shehbaz', 'sharif', 'imran_khan', 'zakir_naik', 'thai_sangha', 'council',
        'swami_vivekananda', 'sgpc', 'shiromani', 'pravin_togdiya', 'rss', 'bjp',
        'conservative', 'republican', 'nationalist'
    ],
    
    neutral: [
        'gandhi', 'mahatma', 'buddha', 'dalai_lama', 'mandela', 'abdul_kalam', 'apj',
        'prabodhankar_thakare', 'anil_mishra', 'mother_teresa', 'martin_luther_king',
        'peaceful', 'neutral', 'moderate', 'centrist', 'independent'
    ]
};

export function classifyImage(filename) {
    const cleanFilename = filename.toLowerCase().replace(/[_\-\.]/g, ' ');
    
    for (const [ideology, keywords] of Object.entries(ideologyClassifier)) {
        for (const keyword of keywords) {
            if (cleanFilename.includes(keyword.replace(/_/g, ' '))) {
                return { ideology, confidence: 'high', matchedKeyword: keyword };
            }
        }
    }
    
    return { ideology: 'neutral', confidence: 'low', matchedKeyword: 'default' };
}