import express from 'express';
import multer from 'multer';
import fs from 'node:fs';
import os from 'node:os';
import crypto from 'node:crypto';
import YAML from 'yaml';
import { Client } from '@opensearch-project/opensearch';
const origin = new URL(process.env.OPENSEARCH_URL);
if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) throw Error('Invalid Central origin');
if (origin.protocol === 'http:' && process.env.OPENSEARCH_ALLOW_HTTP !== 'true') throw Error('HTTP requires explicit opt-in');
if (process.env.OPENSEARCH_INDEX_PREFIX !== 'central-byk-test-service-') throw Error('Invalid installation prefix');
const username=fs.readFileSync(process.env.OPENSEARCH_USERNAME_FILE,'utf8'),password=fs.readFileSync(process.env.OPENSEARCH_PASSWORD_FILE,'utf8');
if(!username||!password||username.includes(':')||/[\x00-\x1f]/.test(username+password))throw Error('Invalid credential files');
const client=new Client({node:origin.origin,auth:{username,password},maxRetries:0,requestTimeout:30000,ssl:{rejectUnauthorized:true,...(process.env.OPENSEARCH_CA_FILE?{ca:fs.readFileSync(process.env.OPENSEARCH_CA_FILE)}:{})}});
const owned=new Set(['domain','rules','services']);
const index=name=>{if(!owned.has(name))throw Error('scope_denied');return process.env.OPENSEARCH_INDEX_PREFIX+name};
export async function osPut(name,document){return client.index({index:index(name),id:document.id,body:document,refresh:true})}
export async function osDeleteIndex(name){return client.indices.delete({index:index(name)})}
export async function osDeleteObject(name,id){if(typeof id!=='string'||!id||id.length>512)throw Error('invalid_id');return client.delete({index:index(name),id,refresh:true})}
const router=express.Router();const upload=multer({dest:os.tmpdir()+'/',limits:{fileSize:8*1024*1024}});
function input(req){try{return YAML.parse(req.file?fs.readFileSync(req.file.path,'utf8'):req.body.input)}finally{if(req.file)fs.unlinkSync(req.file.path)}}
function identity(value){if(typeof value!=='string'||!value.trim())throw Error('invalid_identity');return 'service-'+crypto.createHash('sha256').update(value).digest('hex')}
function route(handler){return async(req,res)=>{try{index(req.params.index_name);await handler(req,res)}catch(error){res.status(error.message==='scope_denied'?403:400).json({success:false,error:'request_or_write_failed'})}}}
router.post('/put/:index_name/:index_type',upload.single('input'),route(async(req,res)=>{let value=input(req);value=value.nlu??value.data??value;const doc=value[0];if(!doc||typeof doc!=='object')throw Error('document');doc.id=identity(doc[req.params.index_type]);if(typeof doc.examples==='string')doc.examples=doc.examples.split('\n').map(x=>x.replace(/^- /,'')).filter(Boolean);await osPut(req.params.index_name,doc);res.json({success:true,id:doc.id})}));
async function writeAll(name,documents,res){if(!documents.length||documents.length>1000||new Set(documents.map(x=>x.id)).size!==documents.length)throw Error('batch');const results=[];for(const doc of documents){try{await osPut(name,doc);results.push({id:doc.id,success:true})}catch{results.push({id:doc.id,success:false})}}const success=results.every(x=>x.success);res.status(success?200:207).json({success,results})}
router.post('/bulk/:index_name',upload.single('input'),route(async(req,res)=>{const value=input(req);if(!value||Array.isArray(value)||typeof value!=='object')throw Error('object');const documents=Object.entries(value).filter(([key])=>key!=='version').map(([key,body])=>({[key]:body,id:key}));await writeAll(req.params.index_name,documents,res)}));
router.post('/bulk/:index_name/:index_type',upload.single('input'),route(async(req,res)=>{const value=input(req),rows=value?.[req.params.index_name];if(!Array.isArray(rows))throw Error('list');const docs=rows.map(doc=>({...doc,id:identity(doc[req.params.index_type])}));await writeAll(req.params.index_name,docs,res)}));
router.post('/delete/object/:index_name',route(async(req,res)=>{await osDeleteObject(req.params.index_name,req.body.id);res.json({success:true})}));
router.post('/delete/:index_name/:obj_id',route(async(req,res)=>{await osDeleteObject(req.params.index_name,req.params.obj_id);res.json({success:true})}));
router.post('/delete/:index_name',route(async(req,res)=>{await osDeleteIndex(req.params.index_name);res.json({success:true})}));
router.use((error,req,res,next)=>res.status(400).json({success:false,error:'invalid_upload'}));
export default router;
