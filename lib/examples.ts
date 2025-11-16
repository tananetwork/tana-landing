import fs from 'fs'
import path from 'path'

interface CodeExample {
  id: string
  title: string
  description: string
  code: string
  result: any
  category: string
}

export async function loadCodeExamples(): Promise<CodeExample[]> {
  const examplesDir = path.join(process.cwd(), '../../new_examples')
  const files = fs.readdirSync(examplesDir)
  
  // Get all .ts files and sort them
  const tsFiles = files
    .filter(file => file.endsWith('.ts'))
    .sort()
  
  const examples: CodeExample[] = []
  
  for (const tsFile of tsFiles) {
    const baseName = tsFile.replace('.ts', '')
    const jsonFile = `${baseName}.json`
    
    // Check if corresponding JSON file exists
    if (!files.includes(jsonFile)) {
      console.warn(`Missing JSON file for ${tsFile}`)
      continue
    }
    
    const tsPath = path.join(examplesDir, tsFile)
    const jsonPath = path.join(examplesDir, jsonFile)
    
    // Read TypeScript file
    const tsContent = fs.readFileSync(tsPath, 'utf-8')
    
    // Extract title from first comment line
    const titleMatch = tsContent.match(/^\/\/ (.+)$/m)
    const title = titleMatch ? titleMatch[1] : baseName.replace(/^\d+_/, '').replace(/_/g, ' ')
    
    // Extract description from second comment line
    const descMatch = tsContent.match(/^\/\/ (.+)$/m)
    const description = descMatch ? descMatch[1] : 'TypeScript smart contract'
    
    // Read JSON result
    const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
    const result = JSON.parse(jsonContent)
    
    // Determine category based on filename patterns
    let category = 'Basic'
    if (baseName.includes('transfer') || baseName.includes('escrow') || baseName.includes('token') || baseName.includes('marketplace')) {
      category = 'Finance'
    } else if (baseName.includes('user') || baseName.includes('reputation')) {
      category = 'Identity'
    } else if (baseName.includes('voting') || baseName.includes('dao')) {
      category = 'Governance'
    } else if (baseName.includes('nft') || baseName.includes('royalties')) {
      category = 'Digital Assets'
    } else if (baseName.includes('multisig') || baseName.includes('timelock')) {
      category = 'Security'
    } else if (baseName.includes('supplychain') || baseName.includes('insurance')) {
      category = 'Enterprise'
    }
    
    examples.push({
      id: baseName,
      title,
      description,
      code: tsContent,
      result,
      category
    })
  }
  
  return examples
}