// main.js - Papa Parse MCP Server Actor
import { Actor } from 'apify';
import Papa from 'papaparse';
import axios from 'axios';

// Initialize the Actor
await Actor.init();

try {
    // Get input from the Actor
    const input = await Actor.getInput();
    
    // Validate input
    if (!input) {
        throw new Error('No input provided');
    }

    const {
        operation = 'parse', // parse, unparse, validate
        csvData,              // CSV string or URL
        jsonData,             // JSON data for unparsing
        options = {}          // Papa Parse options
    } = input;

    let result;

    // Default Papa Parse options
    const defaultOptions = {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        ...options
    };

    switch (operation) {
        case 'parse':
            result = await parseCSV(csvData, defaultOptions);
            break;
        
        case 'unparse':
            result = unparseJSON(jsonData, defaultOptions);
            break;
        
        case 'validate':
            result = await validateCSV(csvData, defaultOptions);
            break;
        
        default:
            throw new Error(`Unknown operation: ${operation}`);
    }

    // Save output to dataset
    await Actor.pushData(result);
    
    // Set output for API response
    await Actor.setValue('OUTPUT', result);
    
    console.log('Operation completed successfully');

} catch (error) {
    console.error('Error:', error.message);
    await Actor.fail(error.message);
} finally {
    await Actor.exit();
}

/**
 * Parse CSV data
 */
async function parseCSV(csvData, options) {
    console.log('Parsing CSV...');
    
    let csvContent;

    // Check if csvData is a URL
    if (typeof csvData === 'string' && (csvData.startsWith('http://') || csvData.startsWith('https://'))) {
        console.log('Fetching CSV from URL:', csvData);
        try {
            const response = await axios.get(csvData);
            csvContent = response.data;
        } catch (error) {
            throw new Error(`Failed to fetch CSV from URL: ${error.message}`);
        }
    } else if (typeof csvData === 'string') {
        csvContent = csvData;
    } else {
        throw new Error('csvData must be a string (CSV content or URL)');
    }

    // Parse CSV
    const parsed = Papa.parse(csvContent, options);

    if (parsed.errors.length > 0) {
        console.warn('Parse warnings:', parsed.errors);
    }

    return {
        success: true,
        operation: 'parse',
        data: parsed.data,
        meta: parsed.meta,
        errors: parsed.errors,
        rowCount: parsed.data.length,
        columnCount: parsed.meta.fields ? parsed.meta.fields.length : 0
    };
}

/**
 * Convert JSON to CSV
 */
function unparseJSON(jsonData, options) {
    console.log('Converting JSON to CSV...');
    
    if (!Array.isArray(jsonData)) {
        throw new Error('jsonData must be an array of objects');
    }

    const csv = Papa.unparse(jsonData, options);

    return {
        success: true,
        operation: 'unparse',
        csv: csv,
        rowCount: jsonData.length,
        byteSize: Buffer.byteLength(csv, 'utf8')
    };
}

/**
 * Validate CSV structure
 */
async function validateCSV(csvData, options) {
    console.log('Validating CSV...');
    
    const parseResult = await parseCSV(csvData, options);
    
    // Validation checks
    const validations = {
        hasData: parseResult.data.length > 0,
        hasHeaders: parseResult.meta.fields && parseResult.meta.fields.length > 0,
        hasErrors: parseResult.errors.length > 0,
        isConsistent: checkRowConsistency(parseResult.data),
        emptyFields: findEmptyFields(parseResult.data),
        duplicateHeaders: findDuplicateHeaders(parseResult.meta.fields)
    };

    return {
        success: true,
        operation: 'validate',
        isValid: validations.hasData && !validations.hasErrors && validations.isConsistent,
        validations: validations,
        data: parseResult.data,
        meta: parseResult.meta,
        errors: parseResult.errors
    };
}

/**
 * Check if all rows have consistent number of fields
 */
function checkRowConsistency(data) {
    if (data.length === 0) return true;
    
    const firstRowKeys = Object.keys(data[0]);
    const keyCount = firstRowKeys.length;
    
    for (let i = 1; i < data.length; i++) {
        if (Object.keys(data[i]).length !== keyCount) {
            return false;
        }
    }
    return true;
}

/**
 * Find fields with empty values
 */
function findEmptyFields(data) {
    const emptyFields = {};
    
    data.forEach((row, index) => {
        Object.entries(row).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') {
                if (!emptyFields[key]) {
                    emptyFields[key] = [];
                }
                emptyFields[key].push(index);
            }
        });
    });
    
    return emptyFields;
}

/**
 * Find duplicate header names
 */
function findDuplicateHeaders(headers) {
    if (!headers) return [];
    
    const seen = new Set();
    const duplicates = [];
    
    headers.forEach(header => {
        if (seen.has(header)) {
            duplicates.push(header);
        }
        seen.add(header);
    });
    
    return duplicates;
}