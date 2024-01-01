---
id: rhel-clustering
sidebar_label: RHEL Clustering
slug: /architecture/linux/rhel-clustering
---

# RHEL Clustering

This is  [Notes from Udemy Class](https://www.udemy.com/course/linux-high-availability-cluster/)

## Starting & Stopping Cluster Services

### Show Cluster Status
```bash
[root@nodea /] pcs cluster status

Cluster Status:
 Stack: corosync
 Current DC: nodea.example.com (version 1.1.19-8.e17-c3c624ea3d) - partition with quorum
 Last updated : Fri Mar 15 14:08:01 2019
 Last change: Fri MAr 15 14:06:39 2019 by hacluster via crmd on nodea.example.com
 3 nodes configured
 3 resources configured

PCSD Status:
 nodea.example.com: Online
 nodeb.example.com: Online
 nodec.example.com: Onlien
```

### Stop Cluster Service from all nodes
```bash
[root@nodea /] pcs cluster stop -all
nodea.example.com: Stopping Cluster (pacemaker)...
nodeb.example.com: Stopping Cluster (pacemaker)...
nodec.example.com: Stopping Cluster (pacemaker)...
nodea.example.com: Stopping Cluster (corosync)...
nodeb.example.com: Stopping Cluster (corosync)...
nodec.example.com: Stopping Cluster (corosync)...
```

### Start Cluster Service from all nodes
```bash
[root@nodea /] pcs cluster start -all
nodea.example.com: Starting Cluster (pacemaker)...
nodeb.example.com: Starting Cluster (pacemaker)...
nodec.example.com: Starting Cluster (pacemaker)...
nodea.example.com: Starting Cluster (corosync)...
nodeb.example.com: Starting Cluster (corosync)...
nodec.example.com: Starting Cluster (corosync)...
```

### Stop Cluster Service from the specific node
```bash
[root@nodea /] pcs cluster stop nodeb.example.com
nodeb.example.com: Stopping Cluster (pacemaker)...
nodeb.example.com: Stopping Cluster (corosync)...
```

### Start Cluster Service from the specific node
```bash
[root@nodea /] pcs cluster stop nodeb.example.com
nodeb.example.com: Starting Cluster (pacemaker)...
nodeb.example.com: Starting Cluster (corosync)...
```

### Enable Cluster Service from all nodes
```bash
[root@nodea /] pcs cluster enable --all
nodea.example.com: Cluster Enabled
nodeb.example.com: Cluster Enabled
nodec.example.com: Cluster Enabled
```

### Disable Cluster Service from all nodes
```bash
[root@nodea /] pcs cluster disable --all
nodea.example.com: Cluster Disabled
nodeb.example.com: Cluster Disabled
nodec.example.com: Cluster Disabled
```

### Enable Cluster Service from the specific node
```bash
[root@nodea /] pcs cluster enable nodeb.example.com
nodeb.example.com: Cluster Enabled
```

### Disable Cluster Service from the specific node
```bash
[root@nodea /] pcs cluster disable nodeb.example.com
nodeb.example.com: Cluster Disabled
```

### Standby Node
```bash
[root@nodea /] pcs cluster standby noded.example.com
[root@nodea /] pcs cluster status
Stack: corosync
Current DC: nodea.example.com (version 1.1.19-8.e17-c3c624ea3d) - partition with quorum
Last updated: Fri Mar 15 18:07:44 2019
Last change: Fri Mar 15 18:07:27 2019 by root via cibadmin on nodea.example.com

4 nodes configured
4 resources configured

Node noded.example.com: standby
Online: [ nodea.example.com nodeb.example.com nodec.example.com ]

Full list of resources:
 
 fence_nodea    (stonith:fence_xvm):    Started nodea.example.com
 fence_nodeb    (stonith:fence_xvm):    Started nodeb.example.com
 fence_nodec    (stonith:fence_xvm):    Started nodec.example.com
 fence_noded    (stonith:fence_xvm):    Started noded.example.com
Daemon Status:
 corosync: active/enabled
 pacemaker: active/enabled
 pcsd: active/enabled
```

### Unstandby Node
```bash
[root@nodea /] pcs cluster unstandby noded.example.com
```

## Adding & Removing A Cluster Node
### Add firewall rule for high-availability
```bash
[root@noded /] firewall-cmd --add-service=high-availability --permanent
success
```
```bash title="Start PCS Service"
[root@noded /] systemctl start pcsd
```
```bash title="Enable the PCS Service"
[root@noded /] systemctl enable pcsd
Created symlink from /etc/systemd/system/multi-user.target.wants/pcsd.service to /usr/lib/systemd/system/pcsd.service.
```
```bash title="Set the password for hacluster user (*this is only for testing)"
[root@noded /] echo "redhat" | passwd ---stdin hacluster
Changling password for user hacluseter.
passwd: all authentication tokens updated successfully.
```
```bash title="Authenticate PCS Cluster Service from the existing node"
[root@nodea /] pcs cluster auth -u hacluster noded.example.com -p redhat
Changling password for user hacluseter.
passwd: all authentication tokens updated successfully.
```
```bash title="Create node from the existing node"
[root@nodea /] pcs cluster node add noded.example.com
Disabling SBD service...
noded.example.com: sbd disabled
Sending remote node configuration files to 'noded.exaple.com'
noded.example.com: successful distribution of the file 'pacemaker_remote authkey'
nodea.example.com: Corysync updated
nodeb.example.com: Corysync updated
nodec.example.com: Corysync updated
Setting up corosync...
noded.example.com: succeeded
Sychronizing pcsd cerfiicateds on nodes noded.example.com...
```
```bash title="Remove node from the cluster"
[root@nodea /] pcs cluster node remove noded.example.com
...
```
```bash title="Authenticate PCS Cluster Service from the new node"
[root@noded /] pcs cluster auth -u hacluster -p redhat
nodea.example.com: Authorized
nodeb.example.com: Authorized
nodec.example.com: Authorized
noded.example.com: Authorized
```
```bash title="Enable and Start cluster service on the new node"
[root@noded /] pcs cluster enable
[root@noded /] pcs cluster start
Starting Cluster (corosync)...
Starting Cluster (pacemaker)...
```

## Fencing Configuration
### Install Fence Service
```bash title="Install Fence Service"
[root@service /] yum install fence-virt fence-vrtd fence-virtd-multicast fence-virtd-libvirt
...
Complete!
```
```bash title="Create a secret key for fencing"
[root@service /] mkdir -p /etc/cluster
[root@service /] dd if=/dev/random of=/etc/cluster/fence_xvm.key bs=512 count=1
0+1 records in
0+1 records out
115 bytes (115 B) copied, 0.000302385 s, 380 kB/s
```
```bash title="Configure Fence Daemon"
[root@service /] fence_virtd -c
Module search path [/usr/lib64/fence-vrt]:
Listener module [multicast]:
Multicast IP Address [225.0.0.12]:
Using ipv4 as family.
Multicast IP Port [1229]:
Interface [virbr0]:
Key File [/etc/cluster/fence_xvm.key]:
Backend module [libvirt]:

...
=== End Configuration ===
Replace /etc/fence_virt.conf with the above [y/N]? y
```
```bash title="Restart the service"
[root@service /] systemctl restart fence_vrtd
[root@service /] systemctl enable fence_vrtd
```
```bash title="Add the Fence Service Port to firewall rule"
[root@service /] firewall-cmd --add-port=1229/udp --permanent
success
[root@service /] firewall-cmd --list-all
public (active)
  target: default
  icmp-block-inversion: no
  interfaces: br0 ens33
  sources:
  services: ssh dhcpv6-client
  ports: 1229/udp
  protocols:
  masquerade : no
  forward-ports:
  source-ports:
  icmp-blocks:
  rich rules:
```
```bash title="Copy Key file to all nodes"
[root@service /] scp -p /etc/cluster/fence_xvm.key nodea:/etc/cluster/
[root@service /] scp -p /etc/cluster/fence_xvm.key nodeb:/etc/cluster/
[root@service /] scp -p /etc/cluster/fence_xvm.key nodec:/etc/cluster/
[root@service /] scp -p /etc/cluster/fence_xvm.key noded:/etc/cluster/
```
```bash title="List All Available Fencing Agent"
[root@nodea /] pcs stonith list
 ...
 fence_ilo4 - Fence agent for IPMI
 ...
 fence_ilo_ssh - Fence agent for HP iLO over SSH
 ...
 fence_vmware_rest - Fence agent for VMware REST API
 fence_xvm - Fence agent for virtual machines
```
```bash title="Describe a specific Fencing Agent"
[root@nodea /] pcs stonith describe fence_xvm
...
```
### Configure Fence
```bash title="Create Stonith
[root@nodea /] pcs stonith create fence_nodea fence_xvm port="nodea.example.com" pcmk_host_list="nodea.example.com"
```
```bash title="Delete Stonith
[root@nodea /] pcs stonith delete fence_noded
Attempting to stop: fence_noded... Stopped
```
```bash title="Show Fencing Agent Configured"
[root@nodea /] pcs stonith show
 fence_nodea    (stonith:fenc_xvm) :    Started nodea.example.com
 fence_nodeb    (stonith:fenc_xvm) :    Started nodeb.example.com
 fence_nodec    (stonith:fenc_xvm) :    Started nodec.example.com
```

### List Fence Nodes
```bash
[root@nodea /] fence_svm -o list
nodea.example.com             b151fad6-5434-3446-fdh4-dfd3545cgffdg on
nodeb.example.com             s3ks3f0d-3403-6344-fhd4-cgffdgdfd3545 on
nodec.example.com             b151fad6-3035-3644-d4fh-dfd3cgffdgds2 on
noded.example.com             ea343l42-2892-4634-8dh4-ah34545cgffdg on
```
### Show Fence Status
```bash
[root@nodea /] fence_xvm -H nodea.example.com -o status
Status: ON
```
### Power Off Node
```bash title="Power Off Node"
[root@nodea /] fence_xvm -H nodea.example.com -o off
```
### Power On Node"
```bash
[root@nodea /] fence_xvm -H nodea.example.com -o on
```

## Quorum Operations
### Show Quorum Status (Quorate)
```bash
[root@nodea /] corosync-quorumtool
------------------
Date:            Fri Mar 15 19:57:06 2019
Quorum provider: corosync_votequorum
Nodes:           4
Node ID:         1
Ring ID:         1/892
Quorate:         Yes

Votequorum information
----------------------
Expected votes:   4
Highest expected: 4
Total votes:      4
Quorum:           3
Flags:            Quorate

Membership information
----------------------
    Nodeid     Votes Name
         1         1 nodea.example.com (local)
         2         1 nodeb.example.com
         3         1 nodec.example.com
         4         1 noded.example.com
```
### Show Quorum Status (Blocked)
```bash
[root@nodea /] corosync-quorumtool
------------------
Date:            Fri Mar 15 19:57:06 2019
Quorum provider: corosync_votequorum
Nodes:           2
Node ID:         1
Ring ID:         1/908
Quorate:         No

Votequorum information
----------------------
Expected votes:   4
Highest expected: 4
Total votes:      2
Quorum:           3 Activity blocked
Flags:            

Membership information
----------------------
    Nodeid     Votes Name
         1         1 nodea.example.com (local)
         2         1 nodeb.example.com
```
### Update Quorum to set wait for all
```bash
[root@nodea /] pcs quorum update wait_for_all=1 
```

### Update Quorum to set Auto Tie Breaker (Avoid Split Brain Situation)
```bash
[root@nodea /] pcs quorum update auto_tie_breaker=1 
```

## Creating and Configuring Resources
### Describe Resource Agent
```bash
[root@nodea /] pcs resource describe Filesystem
```
### Create Resource and add to Resource Group
```bash
[root@nodea /] pcs resource create newfs Filesystem device=workstation.example.com:/exports/www directory=/mt1 fstype=nfs options=ro
Assumed agent name 'ocf:heartbeat:Filesystem' (deduced from 'Filesystem')
```
```bash
[root@nodea /] pcs resource create webip IPaddr2 ip-192.168.209.150 nic=eth0:1 cidrr_netmask=24 --group mygroup
Assumed agent name 'ocf:heartbeat:IPaddr2' (deduced from 'IPaddr2')
```
```bash
[root@nodea /] pcs resource create webserv apache --group mygroup
Assumed agent name 'ocf:heartbeat:apache' (deduced from 'apache')
```

### Show Resource
```bash
[root@nodea /] pcs resource show
Resource: newfs  (class=ocf provider=heartbeat type=Filesystem)
  Attributes: device=workstation.example.com:/exports/www directory=/mnt1 fstype=nfs options=ro
  Operations: mnonitor interval=20s timeout=40s (newfs-monitor-interval-20s)
              notify interval=0s timeout=60s (newfs-notify-interval-0s)
              start interval=0s timeout=60s (newfs-start-interval-0s)
              stop interval=0s timeout=60s (newfs-stop-interval-0s)
```

### Update Resource
```bash
[root@nodea /] pcs resource update newfs device=workstation
```
### Delete Resource
```bash
[root@nodea /] pcs delete newfs
```
### Disable Resource Group
```bash
[root@nodea /] pcs resource disable mygroup
```
### Enable Resource Group
```bash
[root@nodea /] pcs resource enable mygroup
```
### Move Resource Group
```bash
[root@nodea /] pcs resource move mygroup nodec.example.com
```
### Ban Resource Group
```bash
[root@nodea /] pcs resource ban mygroup nodec.example.com
Warning: Creating location constraint cli-ban-mygroup-on-nodec.example.com with a score of -INFINITY for resource mygroup on node nodec.example.com.
This will prevent mygroup from running on nodec.example.com until the constraint is removed. This will be the case even if nodec.example.com is the last node in the cluster
[root@nodea /] pcs constraint list
Location Constraints:
  Resource: mygroup
    Enabled on: nodea.example.com (score:INFINITY) (role: Started)
    Disabled on: nodec.example.com (score:-INFINITY) (role: Started)    
Ordering Constraints:
Colocation Constraints:
Ticket Constraints:
```
### Remove Ban Resource Group
```bash
[root@nodea /] pcs resource clear mygroup nodec.example.com
[root@nodea /] pcs constraint list
Location Constraints:
  Resource: mygroup
    Enabled on: nodea.example.com (score:INFINITY) (role: Started)
Ordering Constraints:
Colocation Constraints:
Ticket Constraints:
```

## Configuration File
### Corosync Configuration File and Log Path
```bash
vi /etc/corosync/corosync.conf

...
logging {
    to_logfile: yes
    logfile: /var/log/cluster/corosync.log
    to_syslog: yes
}
```
### Pacemaker Configuration File and Log Path 
It logs to corosync log file by default.
```bash
vi /etc/sysconfig/pacemaker

...
# PCMK_logfile=/var/log/pacemaker.log
```

### How to sync Corysync Config files
```bash
[root@nodea /] pcs cluster sync
```

### How to sync Pacemaker Config files
```bash
[root@nodea /] scp /etc/sysconfig/pacemaker nodeb:/etc/sysconfig
[root@nodea /] scp /etc/sysconfig/pacemaker nodec:/etc/sysconfig
[root@nodea /] scp /etc/sysconfig/pacemaker noded:/etc/sysconfig
[root@nodea /] pcs cluster stop --all
[root@nodea /] pcs cluster start --all
```

## Resource Failures and how to debug
### How to see failcount
```bash
[root@nodea /] pcs resource failcount show webserv
Failcounts for resource 'webserv'
  nodea.example.com: INFINITY
  nodeb.example.com: INFINITY
  nodec.example.com: INFINITY
```
### How to start resource with debug mode
```bash
[root@nodea /] pcs resource debug-start webserv --full | less
...
```

## Complex Resource Group (NFS)
### Create NFS File System Resource
```bash
[root@nodea /] pcs resource create nfsfs Filesystem device=/dev/sda1 directory=/nfsshare fstype=xfs --group nfs
```
### Install NFS Utils
```bash
[root@nodea /] yum install nfs-utils
[root@nodea /] systemctl stop nfs-lock # Make sure nfs-lock stop
[root@nodea /] systemctl disable nfs-lock # Make sure nfs-lock is disabled
```
### Create NFS Server Resource
```bash
[root@nodea /] pcs resource create nfsd nfsserver nfs_shared_infodir=/nfsshare/nfsinfo --group nfs
```
### Create NFS Export Resource
```bash
[root@nodea /] pcs resource create nfsexp exportfs clientspec="*" options=rw,sync,no_root_squash directory=/nfsshare fsid=1 --group nfs
```
### Create NFS IP Resource
```bash
[root@nodea /] pcs resource create nfsip ip=192.168.209.150 cidr_netmask=24 --group nfs
```

### Result of creating NFS Resource Group
```bash
[root@nodea /] pcs status
Cluster name: cluster0
Last updated: tue Apr  2 12:22:16 2019
Last chang: Tue Apr   2 12:22:14 2019
Stack: corosync
Current DC: nodea.example.com (1) - partition with quorum
Version: 1.1.12-a14efad
3 Nodes configured
6 Resources configured

Online: [ nodea.example.com nodeb.example.com nodec.example.com ]

Full list of resources:

 fence_nodea    (stonith:fence_xvm):    Started nodea.example.com
 fence_nodeb    (stonith:fence_xvm):    Started nodeb.example.com
 fence_nodec    (stonith:fence_xvm):    Started nodec.example.com
 Resource Group: nfs
      nfsfs     (ocf::hearbeat:Filesystem):     Started nodea.example.com
      nfsd      (ocf::hearbeat:nfsserver):      Started nodea.example.com
      nfsfs     (ocf::hearbeat:exportfs):       Started nodea.example.com
      nfsip     (ocf::hearbeat:IPaddr2):        Started nodea.example.com

PCSD Status:
  nodea.example.com: Online
  nodeb.example.com: Online
  nodec.example.com: Online
  noded.example.com: Online

Daemon Status:
  corosync: active/enabled
  pacemaker: active/enabled
  pcsd: active/enabled
```

## Managing Constraints
* Constraints are rules that place restrictions on the order in which resources or resource groups may be started, or the nodes on which they may run. Constraints are important for managing complex resource groups or sets of resource groups, which depend upon one another or which may interfere with each other.

- There are three main types of constraints :
  - Order constraints : Control the order in which resources or resource groups are started and stopped.
  - Location constraints : Control the nodes on which resources or resource groups may run.
  - Colocation constraints : Control where two resources or resource groups may run on the same node.

### Add Order Constraints
```bash
[root@nodea /] pcs constraint order A then B
```

### Add Location Constraints (prefers)
```bash
[root@nodea /] pcs constraint location webserv prefers nodea.example.com
[root@nodea /] pcs constraint list
Location Constraints:
   Resource: webserv
     Enabled on: nodea.example.com (score:INFINITY)
Ordering Constraints:
Colocation Constraints:
```
```bash
[root@nodea /] pcs constraint location webserv prefers nodea.example.com=200
[root@nodea /] pcs constraint list
Location Constraints:
   Resource: webserv
     Enabled on: nodea.example.com (score:200)
Ordering Constraints:
Colocation Constraints:
```

### Add Location Constraints (avoids)
```bash
[root@nodea /] pcs constraint location webserv avoids nodec.example.com
[root@nodea /] pcs constraint list
Location Constraints:
   Resource: webserv
     Enabled on: nodea.example.com (score:200)
     Disabled on: nodec.example.com (score:-INFINITY)
Ordering Constraints:
Colocation Constraints:
```

### List All Constraints
```bash
[root@nodea /] pcs constraint list --full
Location Constraints:
Ordering Constraints:
Colocation Constraints:
```

### Show Allocation Scores
```bash
[root@nodea /] crm_simulate -sL
...
```

### Resouce Stickeness
- When resource prefered node is nodea, and resource is failed over to nodeb. Even after nodea is re-available by restoring the node, aovid the situation the resource is fail over back to nodea a by setting resource-stickiness higher then preferred node score.
```bash
[root@nodea /] pcs resource defaults
resource-stickiness: 0
```
```bash
[root@nodea /] pcs resource defaults resource-stickiness=500
resource-stickiness: 0
```

### Colocation Constraints
- Colocatoin consraints specify that two resources must (or must not) run on the same node. To set a colocatoin constraint to keep two resources or resource groups together.

```bash
[root@nodea /] pcs constraint colocation add B with A
```

- A colocation constraint with a score of -INFINITY can also be set to force the two resources or resource groups to never run on the same node.

```bash
[root@nodea /] pcs constraint colocation add B with A -INFINITY
```

## Two Node Cluster Issue
### No room for node failure
As the quorum should be 50% + 1 vote, There is no room for failure with two nodes cluster.

#### two_node option : If one of the nodes goes down, the rest will satisfy the quorum
```bash
[root@nodea /] pvi /etc/corosync/corosync.conf

...
quorum {
  provider: corosync_votequorum
  two_node: 1
}
```
### Split Brain
![Alt text](<split-brain.png>)
If node A and node B constitute a cluster but are unable to communicate with each other, then the following situations may arise:

- Fencing is enabled (fence Racing): Each node will attempt to fence the other node, potentially leading to both nodes being fenced, thus isolating them from the cluster.
- Fencing is disabled : Each node will attempt to set up the cluster independently, possibly resulting in both nodes attempting to start resources simultaneously, leading to a corrupted status due to resource conflicts.

### Fence death/fence racing
To avoid the fence racing from the split brain situation, fence delay can be applied to one of the nodes, so when one node is fenced the other node will be delayed before fencing and start cluster.

### The cluster doe not start until both nodes have started
When two_node is enabled for two nodes cluster, wait-for-all option is also enabled. Because of this, the cluser may not start. So this option should be disabled to avoid the issue.